'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface EnrollmentWithDetails {
  enrollmentId: string;
  cohortId: string;
  programId: string;
  programTitle: string;
  coachName: string;
  startDate: Date;
  endDate: Date;
  enrollmentStatus: string;
  enrolledAt: Date;
  enrolledCount: number;
  sessions: {
    id: string;
    title: string;
    scheduledAt: Date;
    durationMinutes: number;
    orderIndex: number;
  }[];
  explorations: {
    id: string;
    title: string;
    description: string;
    dueDate: Date | null;
  }[];
}

export async function getMyEnrollments(): Promise<ActionResult<EnrollmentWithDetails[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'enrollment:create');

  const studentId = session!.user.id;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                coach: { select: { name: true } },
                explorations: { select: { id: true, title: true, description: true, dueDate: true } },
              },
            },
            sessions: { orderBy: { orderIndex: 'asc' } },
            _count: { select: { enrollments: true } },
            explorations: { select: { id: true, title: true, description: true, dueDate: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const result: EnrollmentWithDetails[] = enrollments.map((e) => ({
      enrollmentId: e.id,
      cohortId: e.cohortId,
      programId: e.cohort.programId,
      programTitle: e.cohort.program.title,
      coachName: e.cohort.program.coach.name,
      startDate: e.cohort.startDate,
      endDate: e.cohort.endDate,
      enrollmentStatus: e.cohort.enrollmentStatus,
      enrolledAt: e.enrolledAt,
      enrolledCount: e.cohort._count.enrollments,
      sessions: e.cohort.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        scheduledAt: s.scheduledAt,
        durationMinutes: s.durationMinutes,
        orderIndex: s.orderIndex,
      })),
      explorations: [
        ...e.cohort.program.explorations,
        ...e.cohort.explorations,
      ],
    }));

    return { success: true, data: result };
  } catch (err) {
    logger.error('getMyEnrollments error', { studentId, error: String(err) });
    return { success: false, error: 'Failed to load enrollments', code: 'INTERNAL_ERROR' };
  }
}
