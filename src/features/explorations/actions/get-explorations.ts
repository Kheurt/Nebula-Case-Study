'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface ExplorationItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  linkedTo: 'program' | 'session';
  sessionLabel?: string;
}

export async function getExplorationsForEnrolled(
  cohortId: string,
): Promise<ActionResult<ExplorationItem[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:read');

  const studentId = session!.user.id;

  try {
    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_cohortId: { studentId, cohortId } },
    });
    if (!enrollment) {
      return { success: false, error: 'You are not enrolled in this cohort', code: 'NOT_ENROLLED' };
    }

    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program: {
          include: {
            explorations: true,
          },
        },
        sessions: {
          include: { explorations: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!cohort) {
      return { success: false, error: 'Cohort not found', code: 'NOT_FOUND' };
    }

    const explorations: ExplorationItem[] = [
      ...cohort.program.explorations.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        dueDate: e.dueDate,
        linkedTo: 'program' as const,
      })),
      ...cohort.sessions.flatMap((s) =>
        s.explorations.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          dueDate: e.dueDate,
          linkedTo: 'session' as const,
          sessionLabel: `Session ${s.orderIndex}: ${s.title}`,
        })),
      ),
    ];

    return { success: true, data: explorations };
  } catch (err) {
    logger.error('getExplorationsForEnrolled error', { cohortId, studentId, error: String(err) });
    return { success: false, error: 'Failed to load explorations', code: 'INTERNAL_ERROR' };
  }
}

export interface CoachExplorationItem {
  id: string;
  title: string;
  description: string;
  submissions: Array<{
    id: string;
    studentName: string;
    responseText: string;
    coachFeedback: string | null;
  }>;
}

export async function getExplorationsForCoach(
  cohortId: string,
): Promise<ActionResult<CoachExplorationItem[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:read');

  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program: {
          include: {
            explorations: {
              include: {
                submissions: {
                  include: { student: { select: { name: true } } },
                },
              },
            },
          },
        },
        sessions: {
          include: {
            explorations: {
              include: {
                submissions: {
                  include: { student: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      return { success: false, error: 'Cohort not found', code: 'NOT_FOUND' };
    }

    const allExplorations: CoachExplorationItem[] = [
      ...cohort.program.explorations.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        submissions: e.submissions.map((s) => ({
          id: s.id,
          studentName: s.student.name ?? 'Student',
          responseText: s.responseText,
          coachFeedback: s.coachFeedback,
        })),
      })),
      ...cohort.sessions.flatMap((sess) =>
        sess.explorations.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          submissions: e.submissions.map((s) => ({
            id: s.id,
            studentName: s.student.name ?? 'Student',
            responseText: s.responseText,
            coachFeedback: s.coachFeedback,
          })),
        })),
      ),
    ];

    return { success: true, data: allExplorations };
  } catch (err) {
    logger.error('getExplorationsForCoach error', { cohortId, error: String(err) });
    return { success: false, error: 'Failed to load explorations', code: 'INTERNAL_ERROR' };
  }
}
