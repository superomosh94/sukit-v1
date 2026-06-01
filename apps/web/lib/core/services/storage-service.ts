import { prisma } from '@/lib/db/prisma';

interface QueryOptions {
  filter?: Record<string, any>;
  sort?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  fields?: string[];
}

interface Migration {
  id: string;
  name: string;
  up: string;
  down?: string;
  appliedAt?: Date;
}

export const storageService = {
  async query(
    model: string,
    options: QueryOptions = {}
  ): Promise<{ data: any[]; total: number }> {
    const {
      filter = {},
      sort = { createdAt: 'desc' },
      limit = 50,
      offset = 0,
    } = options;
    const prismaModel = (prisma as any)[model];
    if (!prismaModel) throw new Error(`Unknown model: ${model}`);

    const where = this.buildWhere(filter);
    const orderBy = this.buildOrderBy(sort);

    const [data, total] = await Promise.all([
      prismaModel.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prismaModel.count({ where }),
    ]);

    return { data, total };
  },

  buildWhere(filter: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (key.endsWith('__contains')) {
        where[key.replace('__contains', '')] = {
          contains: value,
          mode: 'insensitive',
        };
      } else if (key.endsWith('__gt')) {
        where[key.replace('__gt', '')] = { gt: value };
      } else if (key.endsWith('__gte')) {
        where[key.replace('__gte', '')] = { gte: value };
      } else if (key.endsWith('__lt')) {
        where[key.replace('__lt', '')] = { lt: value };
      } else if (key.endsWith('__lte')) {
        where[key.replace('__lte', '')] = { lte: value };
      } else if (key.endsWith('__in')) {
        where[key.replace('__in', '')] = { in: value };
      } else if (key.endsWith('__not')) {
        where[key.replace('__not', '')] = { not: value };
      } else {
        where[key] = value;
      }
    }
    return where;
  },

  buildOrderBy(
    sort: Record<string, 'asc' | 'desc'>
  ): Record<string, 'asc' | 'desc'> {
    return sort;
  },

  async migrate(migrations: Migration[]): Promise<void> {
    for (const migration of migrations) {
      const applied = await prisma.auditLog.findFirst({
        where: {
          resourceType: 'migration',
          resourceId: migration.id,
          action: 'applied',
        },
      });
      if (applied) continue;

      try {
        await prisma.$executeRawUnsafe(migration.up);
        await prisma.auditLog.create({
          data: {
            action: 'applied',
            resourceType: 'migration',
            resourceId: migration.id,
            changes: { name: migration.name },
          },
        });
      } catch (error) {
        throw new Error(`Migration "${migration.id}" failed: ${error}`);
      }
    }
  },

  async backup(model: string): Promise<object> {
    const prismaModel = (prisma as any)[model];
    if (!prismaModel) throw new Error(`Unknown model: ${model}`);
    const data = await prismaModel.findMany();
    return { model, data, exportedAt: new Date().toISOString() };
  },

  async seed(model: string, data: any[]): Promise<number> {
    const prismaModel = (prisma as any)[model];
    if (!prismaModel) throw new Error(`Unknown model: ${model}`);
    let count = 0;
    for (const item of data) {
      await prismaModel.create({ data: item });
      count++;
    }
    return count;
  },

  generateQueryHelpers() {
    return {
      eq: (key: string, value: any) => ({ [key]: value }),
      contains: (key: string, value: string) => ({
        [`${key}__contains`]: value,
      }),
      gt: (key: string, value: number) => ({ [`${key}__gt`]: value }),
      gte: (key: string, value: number) => ({ [`${key}__gte`]: value }),
      lt: (key: string, value: number) => ({ [`${key}__lt`]: value }),
      lte: (key: string, value: number) => ({ [`${key}__lte`]: value }),
      inList: (key: string, values: any[]) => ({ [`${key}__in`]: values }),
      asc: (key: string) => ({ [key]: 'asc' as const }),
      desc: (key: string) => ({ [key]: 'desc' as const }),
    };
  },
};
