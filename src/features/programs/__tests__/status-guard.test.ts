import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cohort: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { validateStatusTransition } from '../services/status-guard';
import { prisma } from '@/lib/prisma';

describe('validateStatusTransition', () => {
  it('allows DRAFT → PUBLISHED', async () => {
    const error = await validateStatusTransition('prog-1', 'DRAFT', 'PUBLISHED');
    expect(error).toBeNull();
  });

  it('blocks PUBLISHED → DRAFT when cohorts exist', async () => {
    vi.mocked(prisma.cohort.count).mockResolvedValue(1);
    const error = await validateStatusTransition('prog-1', 'PUBLISHED', 'DRAFT');
    expect(error).not.toBeNull();
    if (error) expect(error.code).toBe('COHORTS_EXIST');
  });

  it('allows PUBLISHED → DRAFT when no cohorts', async () => {
    vi.mocked(prisma.cohort.count).mockResolvedValue(0);
    const error = await validateStatusTransition('prog-1', 'PUBLISHED', 'DRAFT');
    expect(error).toBeNull();
  });

  it('blocks ARCHIVED → any transition', async () => {
    const error = await validateStatusTransition('prog-1', 'ARCHIVED', 'PUBLISHED');
    expect(error).not.toBeNull();
    if (error) expect(error.code).toBe('ARCHIVED_TERMINAL');
  });

  it('blocks invalid transition', async () => {
    const error = await validateStatusTransition('prog-1', 'PUBLISHED', 'PUBLISHED');
    expect(error).not.toBeNull();
    if (error) expect(error.code).toBe('INVALID_TRANSITION');
  });
});
