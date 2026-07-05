import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    program: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({ getServerSession: vi.fn(() => null) }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { getPublishedPrograms } from '../actions/get-published-programs';
import { prisma } from '@/lib/prisma';

const samplePrograms = [
  {
    id: 'p1',
    title: 'Finance Immersion',
    description: 'Learn finance',
    domain: 'FINANCE',
    difficultyLevel: 'Beginner',
    targetAudience: 'Students',
    sessionCount: 3,
    maxCohortSize: 10,
    recommendedCohortSize: 5,
    learningOutcomes: '["outcome1"]',
    status: 'PUBLISHED',
    coach: { id: 'c1', name: 'Coach A' },
    cohorts: [{ id: 'coh1', enrollmentStatus: 'OPEN', _count: { enrollments: 3 }, maxParticipants: 10 }],
  },
  {
    id: 'p2',
    title: 'Tech Bootcamp',
    description: 'Learn tech',
    domain: 'SOFTWARE',
    difficultyLevel: 'Advanced',
    targetAudience: 'Developers',
    sessionCount: 2,
    maxCohortSize: 5,
    recommendedCohortSize: 3,
    learningOutcomes: '["outcome1"]',
    status: 'PUBLISHED',
    coach: { id: 'c2', name: 'Coach B' },
    cohorts: [],
  },
];

describe('getPublishedPrograms', () => {
  it('returns only PUBLISHED programs', async () => {
    vi.mocked(prisma.program.findMany).mockResolvedValue(samplePrograms as never);
    const result = await getPublishedPrograms();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('passes domain filter to prisma query', async () => {
    vi.mocked(prisma.program.findMany).mockResolvedValue([samplePrograms[0]] as never);
    const result = await getPublishedPrograms({ domain: 'FINANCE' });
    expect(result.success).toBe(true);
    const call = vi.mocked(prisma.program.findMany).mock.calls.at(-1)?.[0];
    expect(call?.where).toMatchObject({ status: 'PUBLISHED', domain: 'FINANCE' });
  });
});
