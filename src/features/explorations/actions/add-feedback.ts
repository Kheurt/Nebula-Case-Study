'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { addFeedbackSchema, AddFeedbackInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function addCoachFeedback(
  submissionId: string,
  input: AddFeedbackInput,
): Promise<ActionResult<void>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:create');

  const parsed = addFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const coachId = session!.user.id;

  try {
    const submission = await prisma.explorationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        exploration: {
          include: {
            program: { select: { coachId: true } },
            session: { include: { cohort: { include: { program: { select: { coachId: true } } } } } },
          },
        },
      },
    });

    if (!submission) {
      return { success: false, error: 'Submission not found', code: 'NOT_FOUND' };
    }

    const programCoachId =
      submission.exploration.program?.coachId ??
      submission.exploration.session?.cohort.program.coachId;

    if (programCoachId !== coachId) {
      return { success: false, error: 'You can only provide feedback on your own programs', code: 'FORBIDDEN' };
    }

    await prisma.explorationSubmission.update({
      where: { id: submissionId },
      data: { coachFeedback: parsed.data.coachFeedback },
    });

    logger.info('Coach feedback added', { submissionId, coachId });
    return { success: true, data: undefined };
  } catch (err) {
    logger.error('addCoachFeedback error', { submissionId, error: String(err) });
    return { success: false, error: 'Failed to save feedback', code: 'INTERNAL_ERROR' };
  }
}
