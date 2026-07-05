'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface CohortDetail {
  id: string;
  programId: string;
  programTitle: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  enrollmentStatus: string;
  sessions: {
    id: string;
    title: string;
    description: string;
    scheduledAt: Date;
    durationMinutes: number;
    orderIndex: number;
  }[];
  enrollments?: {
    id: string;
    studentName: string;
    studentEmail: string;
    enrolledAt: Date;
  }[];
}

export async function getCohortDetail(cohortId: string): Promise<ActionResult<CohortDetail>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'cohort:read');

  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program: { select: { id: true, title: true, coachId: true } },
        sessions: { orderBy: { orderIndex: 'asc' } },
        enrollments: {
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { enrolledAt: 'asc' },
        },
      },
    });

    if (!cohort) {
      return { success: false, error: 'Cohort not found', code: 'NOT_FOUND' };
    }

    const canSeeEnrollments = session?.user?.profileName === 'coach' || session?.user?.profileName === 'admin';
    const result: CohortDetail = {
      id: cohort.id,
      programId: cohort.program.id,
      programTitle: cohort.program.title,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      maxParticipants: cohort.maxParticipants,
      enrollmentStatus: cohort.enrollmentStatus,
      sessions: cohort.sessions,
      ...(canSeeEnrollments
        ? {
            enrollments: cohort.enrollments.map((e) => ({
              id: e.id,
              studentName: e.student.name,
              studentEmail: e.student.email,
              enrolledAt: e.enrolledAt,
            })),
          }
        : {}),
    };

    return { success: true, data: result };
  } catch (err) {
    logger.error('getCohortDetail error', { cohortId, error: String(err) });
    return { success: false, error: 'Failed to load cohort', code: 'INTERNAL_ERROR' };
  }
}
