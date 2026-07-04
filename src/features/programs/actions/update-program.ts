'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { updateProgramSchema, UpdateProgramInput } from '../schemas';
import { validateStatusTransition } from '../services/status-guard';
import { ActionResult } from '@/lib/action-result';

export async function updateProgram(
  programId: string,
  input: UpdateProgramInput,
): Promise<ActionResult<{ programId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'program:edit');

  const parsed = updateProgramSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' };
  }

  try {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }

    // Ownership check
    if (program.coachId !== session!.user.id) {
      return { success: false, error: 'You can only edit your own programs', code: 'FORBIDDEN' };
    }

    const { status, learningOutcomes, ...rest } = parsed.data;

    // Status transition guard
    if (status && status !== program.status) {
      const err = await validateStatusTransition(programId, program.status, status);
      if (err) {
        return { success: false, error: err.message, code: err.code };
      }
    }

    await prisma.program.update({
      where: { id: programId },
      data: {
        ...rest,
        ...(learningOutcomes ? { learningOutcomes: JSON.stringify(learningOutcomes) } : {}),
        ...(status ? { status } : {}),
      },
    });

    logger.info('Program updated', { programId, coachId: session!.user.id, status });
    return { success: true, data: { programId } };
  } catch (err) {
    logger.error('updateProgram error', { programId, error: String(err) });
    return { success: false, error: 'Failed to update program', code: 'INTERNAL_ERROR' };
  }
}
