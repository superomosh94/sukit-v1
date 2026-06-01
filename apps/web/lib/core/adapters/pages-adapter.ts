import { prisma } from '@/lib/db/prisma';
import type { PagesAdapter, Page } from '@sukit/core';

function toPage(p: any): Page {
  return {
    id: p.id,
    siteId: p.siteId,
    title: p.title,
    slug: p.slug,
    isHome: p.isHome,
    settings: (p.pageSettings as Record<string, any>) ?? {},
    sections: [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const prismaPagesAdapter: PagesAdapter = {
  async create(siteId: string, slug: string, title: string): Promise<Page> {
    const page = await prisma.page.create({
      data: { siteId, slug, title },
    });
    return toPage(page);
  },

  async get(siteId: string, pageId: string): Promise<Page> {
    const page = await prisma.page.findFirstOrThrow({
      where: { id: pageId, siteId },
    });
    return toPage(page);
  },

  async save(page: Page): Promise<void> {
    await prisma.page.update({
      where: { id: page.id },
      data: {
        title: page.title,
        slug: page.slug,
        isHome: page.isHome,
        pageSettings: page.settings,
      },
    });
  },

  async delete(siteId: string, pageId: string): Promise<void> {
    await prisma.page.deleteMany({ where: { id: pageId, siteId } });
  },

  async list(siteId: string): Promise<Page[]> {
    const pages = await prisma.page.findMany({
      where: { siteId },
      orderBy: { sortOrder: 'asc' },
    });
    return pages.map(toPage);
  },
};
