'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { CohortRow, classifyPeriod } from '../services/types';
import { ActionResult } from '@/lib/action-result';

export async function getAllCohorts(): Promise<ActionResult<CohortRow[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'admin:read');

  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        program: {
          include: { coach: { select: { name: true } } },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const rows: CohortRow[] = cohorts.map((c) => ({
      id: c.id,
      programTitle: c.program.title,
      coachName: c.program.coach.name,
      startDate: c.startDate,
      endDate: c.endDate,
      enrollmentStatus: c.enrollmentStatus,
      participantCount: c._count.enrollments,
      period: classifyPeriod(c.startDate, c.endDate),
    }));

    return { success: true, data: rows };
  } catch (err) {
    logger.error('getAllCohorts error', { error: String(err) });
    return { success: false, error: 'Failed to load cohorts', code: 'INTERNAL_ERROR' };
  }
}
