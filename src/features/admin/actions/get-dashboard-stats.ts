'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { DashboardStats } from '../services/types';
import { ActionResult } from '@/lib/action-result';

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'admin:read');

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const in7days = new Date(todayStart);
    in7days.setDate(todayStart.getDate() + 7);

    const [
      totalPrograms,
      publishedPrograms,
      activeCohorts,
      totalEnrollments,
      totalStudents,
      totalCoaches,
      upcomingSessions,
      latestEnrollments,
    ] = await Promise.all([
      prisma.program.count(),
      prisma.program.count({ where: { status: 'PUBLISHED' } }),
      prisma.cohort.count({ where: { startDate: { lte: now }, endDate: { gte: now } } }),
      prisma.enrollment.count(),
      prisma.userProfile.count({ where: { profile: { name: 'student' } } }),
      prisma.userProfile.count({ where: { profile: { name: 'coach' } } }),
      prisma.cohortSession.count({ where: { scheduledAt: { gte: todayStart, lte: in7days } } }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { name: true } },
          cohort: { include: { program: { select: { title: true } } } },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalPrograms,
        publishedPrograms,
        activeCohorts,
        totalEnrollments,
        totalStudents,
        totalCoaches,
        upcomingSessions,
        latestEnrollments: latestEnrollments.map((e) => ({
          id: e.id,
          studentName: e.student.name,
          programTitle: e.cohort.program.title,
          enrolledAt: e.enrolledAt,
        })),
      },
    };
  } catch (err) {
    logger.error('getDashboardStats error', { error: String(err) });
    return { success: false, error: 'Failed to load dashboard stats', code: 'INTERNAL_ERROR' };
  }
}
