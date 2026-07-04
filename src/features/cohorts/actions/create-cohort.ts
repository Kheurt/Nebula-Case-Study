'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { createCohortSchema, CreateCohortInput } from '../schemas';
import { validateSessions } from '../services/session-validator';
import { ActionResult } from '@/lib/action-result';

export async function createCohort(
  programId: string,
  input: CreateCohortInput,
): Promise<ActionResult<{ cohortId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'cohort:create');

  const parsed = createCohortSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const { startDate, endDate, maxParticipants, sessions } = parsed.data;

  try {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }
    if (program.status !== 'PUBLISHED') {
      return { success: false, error: 'Program must be published before creating a cohort', code: 'PROGRAM_NOT_PUBLISHED' };
    }
    if (program.coachId !== session!.user.id) {
      return { success: false, error: 'You can only create cohorts for your own programs', code: 'FORBIDDEN' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const validationError = validateSessions(sessions, program.sessionCount, start, end);
    if (validationError) {
      return { success: false, error: validationError.message, code: validationError.code };
    }

    const cohort = await prisma.cohort.create({
      data: {
        programId,
        startDate: start,
        endDate: end,
        maxParticipants,
        enrollmentStatus: 'OPEN',
        sessions: {
          create: sessions.map((s) => ({
            title: s.title,
            description: s.description,
            scheduledAt: new Date(s.scheduledAt),
            durationMinutes: s.durationMinutes ?? 45,
            orderIndex: s.orderIndex,
          })),
        },
      },
    });

    logger.info('Cohort created', { cohortId: cohort.id, programId, coachId: session!.user.id });
    return { success: true, data: { cohortId: cohort.id } };
  } catch (err) {
    logger.error('createCohort error', { programId, error: String(err) });
    return { success: false, error: 'Failed to create cohort', code: 'INTERNAL_ERROR' };
  }
}
