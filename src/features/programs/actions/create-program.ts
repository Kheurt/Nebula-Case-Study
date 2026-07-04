'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { createProgramSchema, CreateProgramInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function createProgram(input: CreateProgramInput): Promise<ActionResult<{ programId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'program:create');

  const parsed = createProgramSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const { learningOutcomes, ...rest } = parsed.data;

  try {
    const program = await prisma.program.create({
      data: {
        ...rest,
        learningOutcomes: JSON.stringify(learningOutcomes),
        status: 'DRAFT',
        coachId: session!.user.id,
      },
    });

    logger.info('Program created', { programId: program.id, coachId: session!.user.id });
    return { success: true, data: { programId: program.id } };
  } catch (err) {
    logger.error('createProgram error', { error: String(err) });
    return { success: false, error: 'Failed to create program', code: 'INTERNAL_ERROR' };
  }
}
