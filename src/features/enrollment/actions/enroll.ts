'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export async function enrollInCohort(cohortId: string): Promise<ActionResult<{ enrollmentId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'enrollment:create');

  const studentId = session!.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cohort = await tx.cohort.findUnique({
        where: { id: cohortId },
        include: { _count: { select: { enrollments: true } } },
      });

      if (!cohort) throw new Error('COHORT_NOT_FOUND');
      if (cohort.enrollmentStatus !== 'OPEN') throw new Error('COHORT_NOT_OPEN');
      if (new Date(cohort.endDate) < new Date()) throw new Error('COHORT_ENDED');
      if (cohort._count.enrollments >= cohort.maxParticipants) throw new Error('COHORT_FULL');

      const enrollment = await tx.enrollment.create({
        data: { studentId, cohortId },
      });

      // Auto-set FULL if capacity reached
      if (cohort._count.enrollments + 1 >= cohort.maxParticipants) {
        await tx.cohort.update({
          where: { id: cohortId },
          data: { enrollmentStatus: 'FULL' },
        });
      }

      return enrollment;
    });

    logger.info('Enrollment created', { enrollmentId: result.id, studentId, cohortId });
    return { success: true, data: { enrollmentId: result.id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message === 'COHORT_NOT_FOUND') {
      return { success: false, error: 'Cohort not found', code: 'COHORT_NOT_FOUND' };
    }
    if (message === 'COHORT_NOT_OPEN') {
      return { success: false, error: 'This cohort is not open for enrollment', code: 'COHORT_NOT_OPEN' };
    }
    if (message === 'COHORT_ENDED') {
      return { success: false, error: 'This cohort has already ended', code: 'COHORT_ENDED' };
    }
    if (message === 'COHORT_FULL') {
      return { success: false, error: 'This cohort is full', code: 'COHORT_FULL' };
    }

    // P2002 = unique constraint violation = duplicate enrollment
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === 'P2002') {
      return { success: false, error: 'You are already enrolled in this cohort', code: 'ALREADY_ENROLLED' };
    }
    // P2003 = foreign key constraint violation = stale session (user no longer in DB)
    if (prismaErr?.code === 'P2003') {
      return { success: false, error: 'Your session is invalid. Please sign out and sign back in.', code: 'SESSION_INVALID' };
    }

    logger.error('enrollInCohort error', { studentId, cohortId, error: message });
    return { success: false, error: 'Enrollment failed. Please try again.', code: 'INTERNAL_ERROR' };
  }
}
