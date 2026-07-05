'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface CoachSessionOption {
  id: string;
  title: string;
  cohortLabel: string;
}

export interface CoachProgramOption {
  id: string;
  title: string;
  sessions: CoachSessionOption[];
}

export async function getCoachProgramOptions(): Promise<ActionResult<CoachProgramOption[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'exploration:create');

  const coachId = session!.user.id;

  try {
    const programs = await prisma.program.findMany({
      where: { coachId },
      include: {
        cohorts: {
          include: {
            sessions: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true },
            },
          },
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    const result: CoachProgramOption[] = programs.map((p) => ({
      id: p.id,
      title: p.title,
      sessions: p.cohorts.flatMap((c) =>
        c.sessions.map((s) => ({
          id: s.id,
          title: s.title,
          cohortLabel: `${p.title} — ${new Date(c.startDate).toLocaleDateString()}`,
        })),
      ),
    }));

    return { success: true, data: result };
  } catch (err) {
    logger.error('getCoachProgramOptions error', { coachId, error: String(err) });
    return { success: false, error: 'Failed to load programs', code: 'INTERNAL_ERROR' };
  }
}
