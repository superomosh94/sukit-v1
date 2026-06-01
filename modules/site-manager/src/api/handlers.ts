import prisma from './db';
import type { CreateSiteInput, CreatePageInput } from '../types';

// ---- Site CRUD ----

export async function getSites(
  userId: string,
  status?: string,
  search?: string
) {
  return prisma.site.findMany({
    where: {
      userId,
      ...(status ? { status: status === 'active' ? undefined : status } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createSite(userId: string, input: CreateSiteInput) {
  return prisma.site.create({
    data: {
      name: input.name,
      description: input.description ?? '',
      host:
        (input as any).slug ?? input.name.toLowerCase().replace(/\s+/g, '-'),
      userId,
      settings: {
        timezone: input.timezone ?? 'UTC',
        language: input.language ?? 'en',
        privacy: 'public',
        seo: { defaultTitle: input.name, defaultDescription: '' },
        codeInjection: { head: '', body: '', css: '', js: '' },
        backups: {
          enabled: true,
          frequency: 'daily',
          retentionDays: 30,
          storage: 'local',
        },
        domain: {
          sslEnabled: false,
          verified: false,
          redirectRules: [],
          aliases: [],
        },
      },
    },
  });
}

export async function getSite(siteId: string) {
  return prisma.site.findUnique({ where: { id: siteId } });
}

export async function updateSite(
  siteId: string,
  data: Record<string, unknown>
) {
  return prisma.site.update({
    where: { id: siteId },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteSite(siteId: string, permanent = false) {
  if (permanent) {
    return prisma.site.delete({ where: { id: siteId } });
  }
  return prisma.site.update({
    where: { id: siteId },
    data: { deletedAt: new Date() } as any,
  });
}

export async function restoreSite(siteId: string) {
  return prisma.site.update({
    where: { id: siteId },
    data: { deletedAt: null } as any,
  });
}

// ---- Page CRUD ----

export async function getPages(siteId: string) {
  return prisma.page.findMany({
    where: { siteId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createPage(siteId: string, input: CreatePageInput) {
  const maxOrder = await prisma.page.findFirst({
    where: { siteId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  return prisma.page.create({
    data: {
      siteId,
      title: input.title,
      slug: input.slug ?? input.title.toLowerCase().replace(/\s+/g, '-'),
      status: (input.status?.toUpperCase() ?? 'DRAFT') as any,
      parentId: input.parentId ?? null,
      sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
      pageSettings: {},
      metadata: {},
    },
  });
}

export async function getPage(pageId: string) {
  return prisma.page.findUnique({ where: { id: pageId } });
}

export async function updatePage(
  pageId: string,
  data: Record<string, unknown>
) {
  const existing = await prisma.page.findUnique({ where: { id: pageId } });
  if (!existing) return null;

  // Save revision before updating
  await prisma.pageRevision.create({
    data: {
      pageId,
      version: (await prisma.pageRevision.count({ where: { pageId } })) + 1,
      title: existing.title,
      slug: existing.slug,
      content: existing.pageSettings ?? {},
      seo: existing.metadata ?? {},
      authorId: existing.createdAt?.toString() ?? 'system',
      notes: (data.revisionNotes as string) ?? null,
    },
  });

  return prisma.page.update({
    where: { id: pageId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deletePage(pageId: string, permanent = false) {
  if (permanent) {
    return prisma.page.delete({ where: { id: pageId } });
  }
  return prisma.page.update({
    where: { id: pageId },
    data: { status: 'ARCHIVED' as any },
  });
}

export async function restorePage(pageId: string) {
  return prisma.page.update({
    where: { id: pageId },
    data: { status: 'DRAFT' as any },
  });
}

export async function duplicatePage(pageId: string) {
  const source = await prisma.page.findUnique({ where: { id: pageId } });
  if (!source) return null;

  return prisma.page.create({
    data: {
      siteId: source.siteId,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy`,
      status: 'DRAFT' as any,
      parentId: source.parentId,
      pageTypeId: source.pageTypeId,
      pageSettings: source.pageSettings as any,
      metadata: source.metadata as any,
    },
  });
}

export async function reorderPage(
  pageId: string,
  parentId: string | null,
  order: number
) {
  return prisma.page.update({
    where: { id: pageId },
    data: { parentId, sortOrder: order },
  });
}

// ---- Revisions ----

export async function getPageRevisions(pageId: string) {
  return prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { version: 'desc' },
    take: 50,
  });
}

export async function restorePageRevision(pageId: string, revisionId: string) {
  const revision = await prisma.pageRevision.findUnique({
    where: { id: revisionId },
  });
  if (!revision) return null;

  return prisma.page.update({
    where: { id: pageId },
    data: {
      title: revision.title,
      slug: revision.slug,
      pageSettings: revision.content as any,
      metadata: revision.seo as any,
      updatedAt: new Date(),
    },
  });
}

// ---- Team ----

export async function getTeamMembers(siteId: string) {
  return prisma.siteRoleAssignment.findMany({
    where: { siteId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function inviteTeamMember(
  siteId: string,
  email: string,
  role: string
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  return prisma.siteRoleAssignment.create({
    data: { siteId, userId: user.id, role },
  });
}

export async function updateTeamMemberRole(memberId: string, role: string) {
  return prisma.siteRoleAssignment.update({
    where: { id: memberId },
    data: { role },
  });
}

export async function removeTeamMember(memberId: string) {
  return prisma.siteRoleAssignment.delete({ where: { id: memberId } });
}

// ---- Activity ----

export async function getActivity(siteId: string, limit = 20) {
  return prisma.userActivity.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { name: true, image: true } } },
  });
}

export async function logActivity(
  siteId: string,
  userId: string,
  action: string
) {
  return prisma.userActivity.create({
    data: { siteId, userId, action },
  });
}

// ---- Templates ----

export async function getTemplates() {
  return prisma.siteTemplate.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function saveTemplate(
  siteId: string,
  name: string,
  category: string,
  createdBy: string
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        include: {
          sections: { include: { columns: { include: { blocks: true } } } },
        },
      },
    },
  });
  if (!site) throw new Error('Site not found');

  return prisma.siteTemplate.create({
    data: {
      name,
      category: category || 'custom',
      createdBy,
      siteData: site as any,
    },
  });
}

export async function applyTemplate(siteId: string, templateId: string) {
  const template = await prisma.siteTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) throw new Error('Template not found');

  const data = template.siteData as any;
  await prisma.site.update({
    where: { id: siteId },
    data: {
      settings: data.settings ?? {},
      head: data.head ?? '',
      foot: data.foot ?? '',
    },
  });
}

export async function deleteTemplate(templateId: string) {
  return prisma.siteTemplate.delete({ where: { id: templateId } });
}

// ---- Backups ----

export async function createBackup(siteId: string, createdBy: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        include: {
          sections: { include: { columns: { include: { blocks: true } } } },
        },
      },
    },
  });

  return prisma.backup.create({
    data: {
      siteId,
      file: JSON.stringify(site),
      size: JSON.stringify(site).length,
      createdBy,
    },
  });
}

export async function getBackups(siteId: string) {
  return prisma.backup.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function restoreBackup(backupId: string) {
  const backup = await prisma.backup.findUnique({ where: { id: backupId } });
  if (!backup) throw new Error('Backup not found');
  return backup;
}

// ---- Bulk Operations ----

export async function bulkPublishPages(pageIds: string[]) {
  return prisma.page.updateMany({
    where: { id: { in: pageIds } },
    data: { status: 'PUBLISHED' as any, publishedAt: new Date() },
  });
}

export async function bulkDeletePages(pageIds: string[]) {
  return prisma.page.updateMany({
    where: { id: { in: pageIds } },
    data: { status: 'ARCHIVED' as any },
  });
}

export async function bulkMovePages(
  pageIds: string[],
  newParentId: string | null
) {
  return prisma.page.updateMany({
    where: { id: { in: pageIds } },
    data: { parentId: newParentId },
  });
}

export async function bulkChangeTemplate(pageIds: string[], template: string) {
  return prisma.page.updateMany({
    where: { id: { in: pageIds } },
    data: { pageTypeId: template },
  });
}
