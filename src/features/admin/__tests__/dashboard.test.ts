import { describe, it, expect, vi } from 'vitest';
import { classifyPeriod } from '../services/types';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    program: { count: vi.fn().mockResolvedValue(5) },
    cohort: { count: vi.fn().mockResolvedValue(3), findMany: vi.fn().mockResolvedValue([]) },
    enrollment: { count: vi.fn().mockResolvedValue(10), findMany: vi.fn().mockResolvedValue([]) },
    userProfile: { count: vi.fn().mockResolvedValue(2) },
    cohortSession: { count: vi.fn().mockResolvedValue(1) },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: { id: 'admin-1', profileName: 'admin', permissions: ['admin:read'] },
  })),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

describe('Admin — classifyPeriod edge cases', () => {
  it('active: startDate = today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    expect(classifyPeriod(today, endDate)).toBe('ACTIVE');
  });

  it('active: endDate = today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    expect(classifyPeriod(startDate, today)).toBe('ACTIVE');
  });

  it('past: endDate = yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startDate = new Date(yesterday);
    startDate.setDate(startDate.getDate() - 30);
    expect(classifyPeriod(startDate, yesterday)).toBe('PAST');
  });

  it('upcoming: startDate = tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 30);
    expect(classifyPeriod(tomorrow, endDate)).toBe('UPCOMING');
  });
});
