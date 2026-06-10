import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['./**/*.test.{ts,tsx}', './**/__tests__/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/lib/utils/cn': path.resolve(__dirname, 'lib/utils/cn'),
      '@/lib/utils/format': path.resolve(__dirname, 'lib/utils/format'),
      '@/lib/db/prisma': path.resolve(__dirname, 'lib/db/prisma'),
      '@/lib/auth/auth': path.resolve(__dirname, 'lib/auth/auth'),
    },
  },
});
