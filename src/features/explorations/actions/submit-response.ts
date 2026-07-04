'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { submitResponseSchema, SubmitResponseInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function submitExplorationResponse(
  explorationId: string,
  input: SubmitResponseInput,
): Promise<ActionResult<{ submissionId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:submit');

  const parsed = submitResponseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const studentId = session!.user.id;

  try {
    const exploration = await prisma.exploration.findUnique({ where: { id: explorationId } });
    if (!exploration) {
      return { success: false, error: 'Exploration not found', code: 'NOT_FOUND' };
    }

    // Enrollment gate: student must be enrolled in the cohort linked to this exploration
    let isEnrolled = false;
    if (exploration.programId) {
      const cohort = await prisma.cohort.findFirst({
        where: { programId: exploration.programId, enrollments: { some: { studentId } } },
      });
      isEnrolled = !!cohort;
    } else if (exploration.sessionId) {
      const session2 = await prisma.cohortSession.findUnique({
        where: { id: exploration.sessionId },
        include: { cohort: { include: { enrollments: { where: { studentId } } } } },
      });
      isEnrolled = (session2?.cohort.enrollments.length ?? 0) > 0;
    }

    if (!isEnrolled) {
      return { success: false, error: 'You must be enrolled to submit a response', code: 'NOT_ENROLLED' };
    }

    const submission = await prisma.explorationSubmission.create({
      data: { explorationId, studentId, responseText: parsed.data.responseText },
    });

    logger.info('Exploration response submitted', { submissionId: submission.id, studentId, explorationId });
    return { success: true, data: { submissionId: submission.id } };
  } catch (err: unknown) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === 'P2002') {
      return { success: false, error: 'You have already submitted a response for this exploration', code: 'DUPLICATE_SUBMISSION' };
    }
    logger.error('submitExplorationResponse error', { explorationId, studentId, error: String(err) });
    return { success: false, error: 'Submission failed', code: 'INTERNAL_ERROR' };
  }
}
