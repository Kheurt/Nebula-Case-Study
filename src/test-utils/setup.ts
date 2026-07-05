import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => null),
}));
