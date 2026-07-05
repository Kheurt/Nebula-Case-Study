'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface ExplorationRow {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  programTitle: string | null;
  sessionTitle: string | null;
  submissionCount: number;
}

export async function getAllExplorations(): Promise<ActionResult<ExplorationRow[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'admin:read');

  try {
    const explorations = await prisma.exploration.findMany({
      include: {
        program: { select: { title: true } },
        session: { select: { title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows: ExplorationRow[] = explorations.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      dueDate: e.dueDate,
      programTitle: e.program?.title ?? null,
      sessionTitle: e.session?.title ?? null,
      submissionCount: e._count.submissions,
    }));

    return { success: true, data: rows };
  } catch (err) {
    logger.error('getAllExplorations error', { error: String(err) });
    return { success: false, error: 'Failed to load explorations', code: 'INTERNAL_ERROR' };
  }
}
