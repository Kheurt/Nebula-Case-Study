import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../../test-utils/prisma-mock';
import { prismaMock } from '../../../test-utils/prisma-mock';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed_password')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
  hash: vi.fn(() => Promise.resolve('hashed_password')),
}));

// Mock next-auth
vi.mock('next-auth', () => ({ getServerSession: vi.fn(() => null) }));

describe('registerStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when email already exists (P2002)', async () => {
    prismaMock.profile.findUnique.mockResolvedValueOnce({ id: 'profile-student', name: 'student' } as never);
    prismaMock.user.create.mockRejectedValueOnce(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002' })
    );

    const { registerStudent } = await import('../actions/register');
    const result = await registerStudent({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('DUPLICATE_EMAIL');
    }
  });

  it('creates user and userProfile on success', async () => {
    prismaMock.profile.findUnique.mockResolvedValueOnce({ id: 'profile-student', name: 'student' } as never);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 'user-1',
      name: 'New User',
      email: 'new@example.com',
    } as never);

    const { registerStudent } = await import('../actions/register');
    const result = await registerStudent({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123!',
    });

    expect(result.success).toBe(true);
  });
});
