import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cohort: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    enrollment: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: { id: 'student-1', profileName: 'student', permissions: ['enrollment:create'] },
  })),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { enrollInCohort } from '../actions/enroll';
import { prisma } from '@/lib/prisma';

describe('enroll — additional cases', () => {
  it('returns COHORT_NOT_OPEN for CLOSED cohort', async () => {
    // $transaction calls the callback with a `tx` proxy — we make it use prisma directly
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') return fn(prisma as never);
    });
    vi.mocked(prisma.cohort.findUnique).mockResolvedValue({
      id: 'c1',
      enrollmentStatus: 'CLOSED',
      maxParticipants: 10,
      _count: { enrollments: 0 },
    } as never);

    const result = await enrollInCohort('c1');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('COHORT_NOT_OPEN');
  });

  it('does not return COHORT_FULL when count < maxParticipants', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') return fn(prisma as never);
    });
    vi.mocked(prisma.cohort.findUnique).mockResolvedValue({
      id: 'c1',
      enrollmentStatus: 'OPEN',
      maxParticipants: 10,
      _count: { enrollments: 5 },
    } as never);
    vi.mocked(prisma.enrollment.create).mockResolvedValue({ id: 'e-new' } as never);
    vi.mocked(prisma.cohort.update).mockResolvedValue({} as never);

    const result = await enrollInCohort('c1');
    if (!result.success) {
      expect(result.code).not.toBe('COHORT_FULL');
    }
  });
});
