'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export async function updateCohortStatus(
  cohortId: string,
  status: 'OPEN' | 'CLOSED',
): Promise<ActionResult<void>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'cohort:manage');

  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { program: { select: { coachId: true } } },
    });
    if (!cohort) {
      return { success: false, error: 'Cohort not found', code: 'NOT_FOUND' };
    }
    if (cohort.program.coachId !== session!.user.id) {
      return { success: false, error: 'You can only manage your own cohorts', code: 'FORBIDDEN' };
    }

    await prisma.cohort.update({ where: { id: cohortId }, data: { enrollmentStatus: status } });
    logger.info('Cohort status updated', { cohortId, status, coachId: session!.user.id });
    return { success: true, data: undefined };
  } catch (err) {
    logger.error('updateCohortStatus error', { cohortId, error: String(err) });
    return { success: false, error: 'Failed to update cohort status', code: 'INTERNAL_ERROR' };
  }
}
