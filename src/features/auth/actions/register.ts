'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { registerSchema, RegisterInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function registerStudent(input: RegisterInput): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' };
  }

  const { name, email, password } = parsed.data;

  logger.info('Registration attempt', { email });

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const studentProfile = await prisma.profile.findUnique({ where: { name: 'student' } });
    if (!studentProfile) {
      return { success: false, error: 'Student profile not configured', code: 'PROFILE_NOT_FOUND' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        userProfile: {
          create: { profileId: studentProfile.id },
        },
      },
    });

    logger.info('Registration success', { userId: user.id });
    return { success: true, data: { userId: user.id } };
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === 'P2002') {
      logger.warn('Registration failed: duplicate email', { email });
      return { success: false, error: 'An account with this email already exists', code: 'DUPLICATE_EMAIL' };
    }
    logger.error('Registration error', { email, error: String(err) });
    return { success: false, error: 'Registration failed. Please try again.', code: 'INTERNAL_ERROR' };
  }
}
