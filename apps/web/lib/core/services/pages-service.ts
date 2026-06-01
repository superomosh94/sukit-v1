import { prisma } from '@/lib/db/prisma';
import type { Page } from '@sukit/core';

interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  status: string;
  children: PageTreeNode[];
}

export const pagesService = {
  async getTree(siteId: string): Promise<PageTreeNode[]> {
    const pages = await prisma.page.findMany({
      where: { siteId },
      orderBy: { sortOrder: 'asc' },
    });
    const buildTree = (parentId: string | null): PageTreeNode[] => {
      return pages
        .filter((p) => (p.parentId ?? null) === parentId)
        .map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status.toLowerCase(),
          children: buildTree(p.id),
        }));
    };
    return buildTree(null);
  },

  async reorder(siteId: string, pageIds: string[]): Promise<void> {
    for (let i = 0; i < pageIds.length; i++) {
      await prisma.page.update({
        where: { id: pageIds[i] },
        data: { sortOrder: i },
      });
    }
  },

  async setStatus(
    pageId: string,
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ): Promise<void> {
    const update: any = { status };
    if (status === 'PUBLISHED') {
      update.publishedAt = new Date();
    }
    await prisma.page.update({ where: { id: pageId }, data: update });
  },

  async applyTemplate(pageId: string, templateId: string): Promise<void> {
    // In production, would apply a page template
  },

  async getRevisions(pageId: string): Promise<any[]> {
    return prisma.pageRevision.findMany({
      where: { pageId },
      orderBy: { version: 'desc' },
    });
  },

  async createRevision(
    pageId: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    const page = await prisma.page.findUniqueOrThrow({ where: { id: pageId } });
    const latestVersion = await prisma.pageRevision.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' },
    });
    await prisma.pageRevision.create({
      data: {
        pageId,
        version: (latestVersion?.version ?? 0) + 1,
        title: page.title,
        slug: page.slug,
        content: {},
        seo: {},
        authorId: userId,
        notes,
      },
    });
  },

  async restoreRevision(pageId: string, version: number): Promise<void> {
    const revision = await prisma.pageRevision.findFirstOrThrow({
      where: { pageId, version },
    });
    await prisma.page.update({
      where: { id: pageId },
      data: { title: revision.title, slug: revision.slug },
    });
  },

  async bulkOperation(
    siteId: string,
    operation: 'publish' | 'draft' | 'delete' | 'archive',
    pageIds: string[]
  ): Promise<number> {
    let count = 0;
    for (const pageId of pageIds) {
      if (operation === 'delete') {
        await prisma.page.deleteMany({ where: { id: pageId, siteId } });
      } else {
        const status =
          operation === 'publish'
            ? 'PUBLISHED'
            : operation === 'archive'
              ? 'ARCHIVED'
              : 'DRAFT';
        await prisma.page.update({
          where: { id: pageId },
          data: { status: status as any },
        });
      }
      count++;
    }
    return count;
  },

  async generateSlug(title: string, siteId: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!slug) slug = 'page';
    let exists = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug } },
    });
    let counter = 1;
    while (exists) {
      slug = `${slug}-${counter}`;
      exists = await prisma.page.findUnique({
        where: { siteId_slug: { siteId, slug } },
      });
      counter++;
    }
    return slug;
  },

  async lock(pageId: string, userId: string): Promise<boolean> {
    const existing = await prisma.collaborationLock.findUnique({
      where: { blockId: pageId },
    });
    if (existing && existing.userId !== userId) return false;
    await prisma.collaborationLock.upsert({
      where: { blockId: pageId },
      update: {
        userId,
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      create: {
        blockId: pageId,
        siteId: '',
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return true;
  },

  async unlock(pageId: string): Promise<void> {
    await prisma.collaborationLock.deleteMany({ where: { blockId: pageId } });
  },

  async copy(pageId: string, targetSiteId: string): Promise<Page> {
    const source = await prisma.page.findUniqueOrThrow({
      where: { id: pageId },
    });
    const page = await prisma.page.create({
      data: {
        siteId: targetSiteId,
        title: `${source.title} (Copy)`,
        slug: `${source.slug}-copy`,
      },
    });
    return {
      id: page.id,
      siteId: page.siteId,
      title: page.title,
      slug: page.slug,
      isHome: page.isHome,
      settings: (page.pageSettings as any) ?? {},
      sections: [],
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };
  },

  async move(
    pageId: string,
    targetSiteId: string,
    parentId?: string
  ): Promise<void> {
    await prisma.page.update({
      where: { id: pageId },
      data: { siteId: targetSiteId, parentId: parentId ?? null },
    });
  },

  async merge(sourcePageId: string, targetPageId: string): Promise<void> {
    const source = await prisma.page.findUniqueOrThrow({
      where: { id: sourcePageId },
    });
    const target = await prisma.page.findUniqueOrThrow({
      where: { id: targetPageId },
    });
    await prisma.pageRevision.create({
      data: {
        pageId: targetPageId,
        version: 1,
        title: target.title,
        slug: target.slug,
        content: { mergedFrom: source.title, sourceId: sourcePageId },
        seo: {},
        authorId: 'system',
        notes: `Merged from ${source.title}`,
      },
    });
    await prisma.page.delete({ where: { id: sourcePageId } });
  },

  async search(query: string, siteId?: string): Promise<Page[]> {
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (siteId) where.siteId = siteId;
    const pages = await prisma.page.findMany({
      where,
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });
    return pages.map((p) => ({
      id: p.id,
      siteId: p.siteId,
      title: p.title,
      slug: p.slug,
      isHome: p.isHome,
      settings: (p.pageSettings as any) ?? {},
      sections: [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  },
};
