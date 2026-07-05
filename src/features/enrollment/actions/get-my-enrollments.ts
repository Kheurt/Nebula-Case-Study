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
    explorationCount: number;
  }[];
  explorations: {
    id: string;
    title: string;
    description: string;
    dueDate: Date | null;
    source: 'program' | 'session';
    programTitle: string;
    sessionTitle: string | null;
    submission: {
      id: string;
      responseText: string;
      coachFeedback: string | null;
      createdAt: Date;
    } | null;
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
                explorations: {
                  select: {
                    id: true, title: true, description: true, dueDate: true,
                    submissions: {
                      where: { studentId },
                      select: { id: true, responseText: true, coachFeedback: true, createdAt: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            sessions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                explorations: {
                  select: {
                    id: true, title: true, description: true, dueDate: true,
                    submissions: {
                      where: { studentId },
                      select: { id: true, responseText: true, coachFeedback: true, createdAt: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            _count: { select: { enrollments: true } },
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
        explorationCount: s.explorations.length,
      })),
      explorations: [
        ...e.cohort.program.explorations.map((exp) => ({
          ...exp,
          source: 'program' as const,
          programTitle: e.cohort.program.title,
          sessionTitle: null,
          submission: exp.submissions[0] ?? null,
        })),
        ...e.cohort.sessions.flatMap((s) =>
          s.explorations.map((exp) => ({
            ...exp,
            source: 'session' as const,
            programTitle: e.cohort.program.title,
            sessionTitle: s.title,
            submission: exp.submissions[0] ?? null,
          })),
        ),
      ],
    }));

    return { success: true, data: result };
  } catch (err) {
    logger.error('getMyEnrollments error', { studentId, error: String(err) });
    return { success: false, error: 'Failed to load enrollments', code: 'INTERNAL_ERROR' };
  }
}
