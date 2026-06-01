import { prisma } from '@/lib/db/prisma';
import type { Site } from '@sukit/core';

interface SiteListFilters {
  search?: string;
  status?: string;
  userId?: string;
  limit?: number;
  offset?: number;
  sort?: 'name' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

export const sitesService = {
  async list(
    filters: SiteListFilters = {}
  ): Promise<{ sites: Site[]; total: number }> {
    const {
      search,
      userId,
      limit = 50,
      offset = 0,
      sort = 'createdAt',
      order = 'desc',
    } = filters;
    const where: any = {};
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { host: { contains: search, mode: 'insensitive' } },
      ];
    if (userId) where.userId = userId;

    const [rows, total] = await Promise.all([
      prisma.site.findMany({
        where,
        orderBy: { [sort]: order },
        take: limit,
        skip: offset,
      }),
      prisma.site.count({ where }),
    ]);

    return {
      sites: rows.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.host ?? undefined,
        settings: (s.settings as any) ?? {},
        userId: s.userId,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      total,
    };
  },

  async exportJSON(siteId: string): Promise<object> {
    const site = await prisma.site.findUniqueOrThrow({
      where: { id: siteId },
      include: { pages: true, media: true, menus: true, forms: true },
    });
    return site;
  },

  async import(data: {
    name: string;
    pages?: any[];
    media?: any[];
    userId?: string;
  }): Promise<Site> {
    const site = await prisma.site.create({
      data: { name: data.name, userId: data.userId ?? 'system' },
    });
    if (data.pages) {
      for (const page of data.pages) {
        await prisma.page.create({
          data: { siteId: site.id, title: page.title, slug: page.slug },
        });
      }
    }
    return {
      id: site.id,
      name: site.name,
      domain: site.host ?? undefined,
      settings: {},
      userId: site.userId,
      createdAt: site.createdAt.toISOString(),
      updatedAt: site.updatedAt.toISOString(),
    };
  },

  async duplicate(siteId: string, newName: string): Promise<Site> {
    const source = await prisma.site.findUniqueOrThrow({
      where: { id: siteId },
      include: { pages: true },
    });
    const site = await prisma.site.create({
      data: { name: newName, userId: source.userId },
    });
    for (const page of source.pages) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: page.title,
          slug: page.slug,
          isHome: page.isHome,
        },
      });
    }
    return {
      id: site.id,
      name: site.name,
      domain: site.host ?? undefined,
      settings: {},
      userId: site.userId,
      createdAt: site.createdAt.toISOString(),
      updatedAt: site.updatedAt.toISOString(),
    };
  },

  async transfer(siteId: string, newOwnerId: string): Promise<void> {
    await prisma.site.update({
      where: { id: siteId },
      data: { userId: newOwnerId },
    });
  },

  async archive(siteId: string): Promise<void> {
    await prisma.siteSnapshot.create({
      data: { siteId, file: JSON.stringify(await this.exportJSON(siteId)) },
    });
  },

  async restore(siteId: string, snapshotId: string): Promise<void> {
    const snapshot = await prisma.siteSnapshot.findUniqueOrThrow({
      where: { id: snapshotId },
    });
    // In production, this would restore from snapshot data
  },

  async healthCheck(siteId: string): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
  }> {
    const issues: string[] = [];
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) return { status: 'unhealthy', issues: ['Site not found'] };
    if (!site.host) issues.push('No domain configured');
    if (issues.length === 0) return { status: 'healthy', issues: [] };
    if (issues.length <= 2) return { status: 'degraded', issues };
    return { status: 'unhealthy', issues };
  },

  async repair(siteId: string): Promise<string[]> {
    const fixes: string[] = [];
    const orphanPages = await prisma.page.findMany({ where: { siteId } });
    for (const page of orphanPages) {
      if (!page.slug) {
        await prisma.page.update({
          where: { id: page.id },
          data: { slug: page.title.toLowerCase().replace(/\s+/g, '-') },
        });
        fixes.push(`Fixed slug for page "${page.title}"`);
      }
    }
    return fixes;
  },

  async search(query: string): Promise<Site[]> {
    const rows = await prisma.site.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { host: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      domain: s.host ?? undefined,
      settings: (s.settings as any) ?? {},
      userId: s.userId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  },
};
