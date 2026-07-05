'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { UserRow } from '../services/types';
import { ActionResult } from '@/lib/action-result';

export async function listUsers(): Promise<ActionResult<UserRow[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'admin:read');

  try {
    const users = await prisma.user.findMany({
      include: {
        userProfile: { include: { profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows: UserRow[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      profileName: u.userProfile?.profile.name ?? 'unknown',
      createdAt: u.createdAt,
    }));

    return { success: true, data: rows };
  } catch (err) {
    logger.error('listUsers error', { error: String(err) });
    return { success: false, error: 'Failed to load users', code: 'INTERNAL_ERROR' };
  }
}
