'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { programFilterSchema, ProgramFilterInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export interface ProgramSummary {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficultyLevel: string;
  sessionCount: number;
  maxCohortSize: number;
  coachName: string;
  coachId: string;
  openCohortCount: number;
}

export async function getPublishedPrograms(filters?: ProgramFilterInput): Promise<ActionResult<ProgramSummary[]>> {
  const parsed = programFilterSchema.safeParse(filters ?? {});
  if (!parsed.success) {
    return { success: false, error: 'Invalid filters', code: 'VALIDATION_ERROR' };
  }
  const { domain, search, coachId } = parsed.data;

  try {
    const programs = await prisma.program.findMany({
      where: {
        status: 'PUBLISHED',
        ...(domain ? { domain } : {}),
        ...(coachId ? { coachId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { coach: { name: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        coach: { select: { id: true, name: true } },
        cohorts: {
          where: { enrollmentStatus: 'OPEN' },
          select: { id: true },
        },
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

    logger.info('getPublishedPrograms', { count: result.length, domain, search });
    return { success: true, data: result };
  } catch (err) {
    logger.error('getPublishedPrograms error', { error: String(err) });
    return { success: false, error: 'Failed to load programs', code: 'INTERNAL_ERROR' };
  }
}
