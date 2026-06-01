import { prisma } from '@/lib/db/prisma';
import type { StorageAdapter } from '@sukit/core';

export const prismaStorageAdapter: StorageAdapter = {
  async get<T>(key: string): Promise<T | null> {
    const row = await prisma.option.findUnique({
      where: { key_siteId: { key, siteId: null } },
    });
    return row ? (row.value as T) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await prisma.option.upsert({
      where: { key_siteId: { key, siteId: null } },
      update: { value: value as any },
      create: { key, value: value as any, autoload: false },
    });
  },

  async delete(key: string): Promise<void> {
    await prisma.option.deleteMany({ where: { key, siteId: null } });
  },

  async has(key: string): Promise<boolean> {
    const count = await prisma.option.count({
      where: { key, siteId: null },
    });
    return count > 0;
  },
};
