'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { createExplorationSchema, CreateExplorationInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function createExploration(
  input: CreateExplorationInput,
): Promise<ActionResult<{ explorationId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:create');

  const parsed = createExplorationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' };
  }

  const { title, description, dueDate, programId, sessionId } = parsed.data;
  const coachId = session!.user.id;

  try {
    // Verify ownership
    if (programId) {
      const program = await prisma.program.findUnique({ where: { id: programId } });
      if (!program || program.coachId !== coachId) {
        return { success: false, error: 'Program not found or access denied', code: 'FORBIDDEN' };
      }
    }

    if (sessionId) {
      const cohortSession = await prisma.cohortSession.findUnique({
        where: { id: sessionId },
        include: { cohort: { include: { program: { select: { coachId: true } } } } },
      });
      if (!cohortSession || cohortSession.cohort.program.coachId !== coachId) {
        return { success: false, error: 'Session not found or access denied', code: 'FORBIDDEN' };
      }
    }

    const exploration = await prisma.exploration.create({
      data: {
        title,
        description,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...(programId ? { programId } : {}),
        ...(sessionId ? { sessionId } : {}),
      },
    });

    logger.info('Exploration created', { explorationId: exploration.id, coachId });
    return { success: true, data: { explorationId: exploration.id } };
  } catch (err) {
    logger.error('createExploration error', { error: String(err) });
    return { success: false, error: 'Failed to create exploration', code: 'INTERNAL_ERROR' };
  }
}
