'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';
import { ActionResult } from '@/lib/action-result';

export interface EnrollmentRow {
  id: string;
  studentName: string;
  studentEmail: string;
  programTitle: string;
  cohortStartDate: Date;
  enrolledAt: Date;
}

export async function getAllEnrollments(): Promise<ActionResult<EnrollmentRow[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'admin:read');

  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: { select: { name: true, email: true } },
        cohort: {
          include: {
            program: { select: { title: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const rows: EnrollmentRow[] = enrollments.map((e) => ({
      id: e.id,
      studentName: e.student.name,
      studentEmail: e.student.email,
      programTitle: e.cohort.program.title,
      cohortStartDate: e.cohort.startDate,
      enrolledAt: e.enrolledAt,
    }));

    return { success: true, data: rows };
  } catch (err) {
    logger.error('getAllEnrollments error', { error: String(err) });
    return { success: false, error: 'Failed to load enrollments', code: 'INTERNAL_ERROR' };
  }
}
