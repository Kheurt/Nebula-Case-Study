'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';
import { ProgramSummary } from './get-published-programs';

export async function getCoachPrograms(): Promise<ActionResult<ProgramSummary[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'program:edit');

  try {
    const programs = await prisma.program.findMany({
      where: { coachId: session!.user.id },
      include: {
        coach: { select: { id: true, name: true } },
        cohorts: { where: { enrollmentStatus: 'OPEN' }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result: ProgramSummary[] = programs.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      domain: p.domain,
      difficultyLevel: p.difficultyLevel,
      sessionCount: p.sessionCount,
      maxCohortSize: p.maxCohortSize,
      coachName: p.coach.name,
      coachId: p.coach.id,
      openCohortCount: p.cohorts.length,
    }));

    return { success: true, data: result };
  } catch (err) {
    logger.error('getCoachPrograms error', { error: String(err) });
    return { success: false, error: 'Failed to load programs', code: 'INTERNAL_ERROR' };
  }
}
