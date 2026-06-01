import { prisma } from '@/lib/db/prisma';

export interface SettingDefinition {
  key: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'json' | 'color' | 'code';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  category?: string;
  required?: boolean;
  dependsOn?: { key: string; value: any };
  permission?: string;
  visible?: boolean;
}

export interface SettingChange {
  key: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  timestamp: number;
}

export const settingsService = {
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    const row = await prisma.option.findUnique({
      where: { key_siteId: { key, siteId: null } },
    });
    return (row?.value as T) ?? (defaultValue as T);
  },

  async set<T>(key: string, value: T, changedBy = 'system'): Promise<void> {
    const old = await this.get(key, undefined);
    await prisma.option.upsert({
      where: { key_siteId: { key, siteId: null } },
      update: { value: value as any },
      create: { key, value: value as any, autoload: true },
    });
    if (old !== undefined) {
      await this.audit(key, old, value, changedBy);
    }
  },

  async search(query: string): Promise<Array<{ key: string; value: any }>> {
    const rows = await prisma.option.findMany({
      where: { key: { contains: query, mode: 'insensitive' } },
      take: 50,
    });
    return rows.map((r) => ({ key: r.key, value: r.value }));
  },

  async exportJSON(): Promise<string> {
    const rows = await prisma.option.findMany({ where: { autoload: true } });
    const data: Record<string, any> = {};
    for (const row of rows) data[row.key] = row.value;
    return JSON.stringify(data, null, 2);
  },

  async importJSON(json: string): Promise<number> {
    const data = JSON.parse(json);
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      await prisma.option.upsert({
        where: { key_siteId: { key, siteId: null } },
        update: { value: value as any },
        create: { key, value: value as any, autoload: true },
      });
      count++;
    }
    return count;
  },

  async reset(key: string): Promise<void> {
    await prisma.option.deleteMany({ where: { key, siteId: null } });
  },

  async getCategories(): Promise<string[]> {
    const rows = await prisma.option.findMany({
      where: { key: { startsWith: 'category:' } },
    });
    return rows.map((r) => r.value as string);
  },

  updateDependency(key: string, dependsOn: { key: string; value: any }): void {
    // Store dependency metadata - would use a proper model in production
  },

  async audit(
    key: string,
    oldValue: any,
    newValue: any,
    changedBy: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'settings.update',
        resourceType: 'setting',
        resourceId: key,
        changes: { key, oldValue, newValue },
        userName: changedBy,
      },
    });
  },

  getAuditLog(key?: string) {
    return prisma.auditLog.findMany({
      where: key
        ? { resourceType: 'setting', resourceId: key }
        : { resourceType: 'setting' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  },

  async getVersionHistory(key: string) {
    return prisma.auditLog.findMany({
      where: { resourceType: 'setting', resourceId: key },
      orderBy: { createdAt: 'desc' },
    });
  },
};
