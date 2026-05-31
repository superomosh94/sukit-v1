import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-auth', () => ({
  default: () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: 'test-user', email: 'test@example.com' } }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/lib/db/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    site: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    page: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    media: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    module: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
  };
  return { prisma: mockPrisma, default: mockPrisma };
});
