import { prisma } from '@/lib/db/prisma';
import type { SitesAdapter, Site } from '@sukit/core';

function toSite(s: any): Site {
  return {
    id: s.id,
    name: s.name,
    domain: s.host ?? undefined,
    settings: (s.settings as Record<string, any>) ?? {},
    userId: s.userId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const prismaSitesAdapter: SitesAdapter = {
  async create(
    name: string,
    options?: { domain?: string; template?: string }
  ): Promise<Site> {
    const site = await prisma.site.create({
      data: { name, host: options?.domain, userId: 'system' },
    });
    return toSite(site);
  },

  async get(id: string): Promise<Site> {
    const site = await prisma.site.findUniqueOrThrow({ where: { id } });
    return toSite(site);
  },

  async update(id: string, data: Partial<Site>): Promise<Site> {
    const site = await prisma.site.update({
      where: { id },
      data: { name: data.name, host: data.domain },
    });
    return toSite(site);
  },

  async delete(id: string): Promise<void> {
    await prisma.site.delete({ where: { id } });
  },

  async list(options?: { limit?: number; offset?: number }): Promise<Site[]> {
    const sites = await prisma.site.findMany({
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: { createdAt: 'desc' },
    });
    return sites.map(toSite);
  },
};
