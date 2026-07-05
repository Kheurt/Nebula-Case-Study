'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface ExplorationDetailSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  responseText: string;
  coachFeedback: string | null;
  createdAt: string;
}

export interface ExplorationDetail {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  programTitle: string | null;
  sessionTitle: string | null;
  createdAt: string;
  submissions: ExplorationDetailSubmission[];
}

export async function getExplorationDetail(
  explorationId: string,
): Promise<ActionResult<ExplorationDetail>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:read');

  const coachId = session!.user.id;

  try {
    const exploration = await prisma.exploration.findUnique({
      where: { id: explorationId },
      include: {
        program: { select: { title: true, coachId: true } },
        session: {
          select: {
            title: true,
            cohort: { select: { program: { select: { coachId: true } } } },
          },
        },
        submissions: {
          include: { student: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!exploration) {
      return { success: false, error: 'Exploration not found', code: 'NOT_FOUND' };
    }

    const ownerCoachId =
      exploration.program?.coachId ??
      exploration.session?.cohort.program.coachId;

    if (ownerCoachId !== coachId) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }

    const detail: ExplorationDetail = {
      id: exploration.id,
      title: exploration.title,
      description: exploration.description,
      dueDate: exploration.dueDate?.toISOString() ?? null,
      programTitle: exploration.program?.title ?? null,
      sessionTitle: exploration.session?.title ?? null,
      createdAt: exploration.createdAt.toISOString(),
      submissions: exploration.submissions.map((s) => ({
        id: s.id,
        studentName: s.student.name,
        studentEmail: s.student.email,
        responseText: s.responseText,
        coachFeedback: s.coachFeedback,
        createdAt: s.createdAt.toISOString(),
      })),
    };

    return { success: true, data: detail };
  } catch (err) {
    logger.error('getExplorationDetail error', { explorationId, coachId, error: String(err) });
    return { success: false, error: 'Failed to load exploration', code: 'INTERNAL_ERROR' };
  }
}
