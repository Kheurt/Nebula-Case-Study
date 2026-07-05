import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface StatusTransitionError {
  code: string;
  message: string;
}

export async function validateStatusTransition(
  programId: string,
  currentStatus: string,
  newStatus: ProgramStatus,
): Promise<StatusTransitionError | null> {
  // ARCHIVED is terminal
  if (currentStatus === 'ARCHIVED') {
    return { code: 'ARCHIVED_TERMINAL', message: 'Archived programs cannot be changed.' };
  }

  // DRAFT → PUBLISHED: always allowed
  if (currentStatus === 'DRAFT' && newStatus === 'PUBLISHED') return null;

  // PUBLISHED → DRAFT: only if no cohorts
  if (currentStatus === 'PUBLISHED' && newStatus === 'DRAFT') {
    const cohortCount = await prisma.cohort.count({ where: { programId } });
    if (cohortCount > 0) {
      return {
        code: 'COHORTS_EXIST',
        message: 'Cannot revert to Draft — cohorts already exist for this program.',
      };
    }
    return null;
  }

  // PUBLISHED → ARCHIVED: blocked if any cohort has active enrollments
  if (currentStatus === 'PUBLISHED' && newStatus === 'ARCHIVED') {
    const cohorts = await prisma.cohort.findMany({
      where: { programId },
      select: { id: true, enrollmentStatus: true },
    });
    const blocking = cohorts.filter((c) => c.enrollmentStatus === 'OPEN' || c.enrollmentStatus === 'FULL');
    if (blocking.length > 0) {
      return {
        code: 'ACTIVE_ENROLLMENTS',
        message: `Cannot archive — ${blocking.length} cohort(s) have active enrollments.`,
      };
    }
    return null;
  }

  return { code: 'INVALID_TRANSITION', message: `Cannot transition from ${currentStatus} to ${newStatus}.` };
}
