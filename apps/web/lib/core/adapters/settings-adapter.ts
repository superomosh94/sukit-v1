import { prisma } from '@/lib/db/prisma';
import type { SettingsAdapter } from '@sukit/core';

export const prismaSettingsAdapter: SettingsAdapter = {
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    const row = await prisma.option.findUnique({
      where: { key_siteId: { key, siteId: null } },
    });
    return (row?.value as T) ?? (defaultValue as T);
  },

  async set<T>(key: string, value: T): Promise<void> {
    await prisma.option.upsert({
      where: { key_siteId: { key, siteId: null } },
      update: { value: value as any },
      create: { key, value: value as any, autoload: false },
    });
  },
};
