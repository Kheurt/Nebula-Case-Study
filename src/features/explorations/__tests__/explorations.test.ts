import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    exploration: { findMany: vi.fn() },
    enrollment: { findUnique: vi.fn() },
    cohort: { findUnique: vi.fn() },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: { id: 'user-1', profileName: 'student', permissions: ['exploration:read', 'exploration:submit'] },
  })),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { getExplorationsForEnrolled } from '../actions/get-explorations';
import { prisma } from '@/lib/prisma';

describe('getExplorationsForEnrolled', () => {
  it('returns error when student not enrolled', async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
    const result = await getExplorationsForEnrolled('cohort-1');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('NOT_ENROLLED');
  });

  it('returns explorations for enrolled student', async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ id: 'enroll-1' } as never);
    vi.mocked(prisma.cohort.findUnique).mockResolvedValue({
      id: 'cohort-1',
      program: { explorations: [{ id: 'exp-1', title: 'Task 1', description: 'Do this', dueDate: null }] },
      sessions: [],
    } as never);
    const result = await getExplorationsForEnrolled('cohort-1');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });
});
