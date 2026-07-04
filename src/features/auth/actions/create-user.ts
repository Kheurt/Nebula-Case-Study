'use server';

import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { createUserSchema, CreateUserInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function createUser(input: CreateUserInput): Promise<ActionResult<{ userId: string }>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'user:create');

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const { name, email, password, profileName } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const profile = await prisma.profile.findUnique({ where: { name: profileName } });
    if (!profile) {
      return { success: false, error: `Profile '${profileName}' not found`, code: 'PROFILE_NOT_FOUND' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        userProfile: { create: { profileId: profile.id } },
      },
    });

    logger.info('Admin created user', { userId: user.id, profileName, createdBy: session?.user?.id });
    return { success: true, data: { userId: user.id } };
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === 'P2002') {
      return { success: false, error: 'An account with this email already exists', code: 'DUPLICATE_EMAIL' };
    }
    logger.error('Create user error', { email, error: String(err) });
    return { success: false, error: 'Failed to create user', code: 'INTERNAL_ERROR' };
  }
}
