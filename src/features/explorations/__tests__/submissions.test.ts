import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    explorationSubmission: {
      create: vi.fn(),
    },
    enrollment: { findFirst: vi.fn() },
    exploration: { findUnique: vi.fn() },
    cohort: { findFirst: vi.fn() },
    cohortSession: { findUnique: vi.fn() },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: { id: 'user-1', profileName: 'student', permissions: ['exploration:submit'] },
  })),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { submitExplorationResponse } from '../actions/submit-response';
import { prisma } from '@/lib/prisma';

describe('submitExplorationResponse', () => {
  it('returns error when student not enrolled', async () => {
    vi.mocked(prisma.exploration.findUnique).mockResolvedValue({ id: 'exp-1', programId: 'p1', sessionId: null } as never);
    vi.mocked(prisma.cohort.findFirst).mockResolvedValue(null);

    const result = await submitExplorationResponse('exp-1', { responseText: 'my answer' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('NOT_ENROLLED');
  });

  it('returns DUPLICATE_SUBMISSION on duplicate', async () => {
    vi.mocked(prisma.exploration.findUnique).mockResolvedValue({ id: 'exp-1', programId: 'p1', sessionId: null } as never);
    vi.mocked(prisma.cohort.findFirst).mockResolvedValue({ id: 'cohort-1', enrollments: [{ studentId: 'user-1' }] } as never);
    vi.mocked(prisma.explorationSubmission.create).mockRejectedValue(
      Object.assign(new Error('Unique constraint'), { code: 'P2002' })
    );

    const result = await submitExplorationResponse('exp-1', { responseText: 'my answer' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('DUPLICATE_SUBMISSION');
  });
});
