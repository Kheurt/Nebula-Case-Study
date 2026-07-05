'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface CohortSummary {
  id: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  enrollmentStatus: string;
  enrolledCount: number;
  remainingSlots: number;
}

export interface ProgramDetail {
  id: string;
  title: string;
  description: string;
  domain: string;
  targetAudience: string;
  difficultyLevel: string;
  sessionCount: number;
  recommendedCohortSize: number;
  maxCohortSize: number;
  learningOutcomes: string[];
  status: string;
  coachId: string;
  coachName: string;
  cohorts: CohortSummary[];
}

export async function getProgramDetail(programId: string): Promise<ActionResult<ProgramDetail>> {
  const session = await getServerSession(authOptions);
  const isCoach = session?.user?.profileName === 'coach';

  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        coach: { select: { id: true, name: true } },
        cohorts: {
          include: { _count: { select: { enrollments: true } } },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!program) {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }

    // Non-coaches only see PUBLISHED programs
    if (!isCoach && program.status !== 'PUBLISHED') {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }

    // Coaches can only see their own non-published programs
    if (isCoach && program.status !== 'PUBLISHED' && program.coachId !== session?.user?.id) {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }

    const result: ProgramDetail = {
      id: program.id,
      title: program.title,
      description: program.description,
      domain: program.domain,
      targetAudience: program.targetAudience,
      difficultyLevel: program.difficultyLevel,
      sessionCount: program.sessionCount,
      recommendedCohortSize: program.recommendedCohortSize,
      maxCohortSize: program.maxCohortSize,
      learningOutcomes: JSON.parse(program.learningOutcomes) as string[],
      status: program.status,
      coachId: program.coach.id,
      coachName: program.coach.name,
      cohorts: program.cohorts.map((c) => ({
        id: c.id,
        startDate: c.startDate,
        endDate: c.endDate,
        maxParticipants: c.maxParticipants,
        enrollmentStatus: c.enrollmentStatus,
        enrolledCount: c._count.enrollments,
        remainingSlots: c.maxParticipants - c._count.enrollments,
      })),
    };

    return { success: true, data: result };
  } catch (err) {
    logger.error('getProgramDetail error', { programId, error: String(err) });
    return { success: false, error: 'Failed to load program', code: 'INTERNAL_ERROR' };
  }
}
