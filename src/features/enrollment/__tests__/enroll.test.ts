import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../../test-utils/prisma-mock';
import { prismaMock } from '../../../test-utils/prisma-mock';

vi.mock('next-auth', () => ({ getServerSession: vi.fn(() => ({
  user: { id: 'user-1', profileName: 'student', permissions: ['enrollment:create'] }
})) }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

describe('enrollInCohort', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when cohort is not OPEN', async () => {
    prismaMock.$transaction.mockImplementationOnce(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        cohort: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'cohort-1',
            enrollmentStatus: 'FULL',
            maxParticipants: 10,
            _count: { enrollments: 10 },
          }),
        },
        enrollment: { create: vi.fn() },
      };
      return fn(tx);
    });

    const { enrollInCohort } = await import('../actions/enroll');
    const result = await enrollInCohort('cohort-1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('COHORT_NOT_OPEN');
    }
  });

  it('returns error when cohort is full', async () => {
    prismaMock.$transaction.mockImplementationOnce(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        cohort: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'cohort-1',
            enrollmentStatus: 'OPEN',
            maxParticipants: 5,
            _count: { enrollments: 5 },
          }),
        },
        enrollment: { create: vi.fn() },
      };
      return fn(tx);
    });

    const { enrollInCohort } = await import('../actions/enroll');
    const result = await enrollInCohort('cohort-1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('COHORT_FULL');
    }
  });
});
