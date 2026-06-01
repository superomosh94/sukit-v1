import { prisma } from '@/lib/db/prisma';
import { createHash } from 'crypto';

export const mediaService = {
  async createFolder(
    siteId: string,
    name: string,
    parentId?: string
  ): Promise<any> {
    return prisma.mediaFolder.create({
      data: { siteId, name, parentId: parentId ?? null, createdBy: 'system' },
    });
  },

  async listFolders(siteId: string, parentId?: string): Promise<any[]> {
    return prisma.mediaFolder.findMany({
      where: { siteId, parentId: parentId ?? null },
      orderBy: { name: 'asc' },
    });
  },

  async getFolderTree(siteId: string): Promise<any[]> {
    const folders = await prisma.mediaFolder.findMany({ where: { siteId } });
    const buildTree = (parentId: string | null): any[] => {
      return folders
        .filter((f) => (f.parentId ?? null) === parentId)
        .map((f) => ({ ...f, children: buildTree(f.id) }));
    };
    return buildTree(null);
  },

  async createTag(siteId: string, name: string): Promise<any> {
    return prisma.mediaTag.upsert({
      where: { siteId_name: { siteId, name } },
      update: {},
      create: { siteId, name },
    });
  },

  async listTags(siteId: string): Promise<any[]> {
    return prisma.mediaTag.findMany({
      where: { siteId },
      orderBy: { name: 'asc' },
    });
  },

  async search(query: string, siteId: string): Promise<any[]> {
    return prisma.mediaAsset.findMany({
      where: {
        siteId,
        trashedAt: null,
        OR: [
          { filename: { contains: query, mode: 'insensitive' } },
          { alt: { contains: query, mode: 'insensitive' } },
          { originalName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    });
  },

  async createVariant(
    assetId: string,
    type: string,
    width: number,
    height: number,
    size: number,
    path: string
  ): Promise<any> {
    return prisma.mediaVariant.create({
      data: { assetId, type, width, height, size, path },
    });
  },

  async getVariants(assetId: string): Promise<any[]> {
    return prisma.mediaVariant.findMany({ where: { assetId } });
  },

  async validate(file: File): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/ogg',
    ];
    if (!allowedTypes.includes(file.type))
      errors.push(`File type "${file.type}" not allowed`);
    if (file.size > 50 * 1024 * 1024) errors.push('File exceeds 50MB limit');
    return { valid: errors.length === 0, errors };
  },

  async detectDuplicate(siteId: string, file: File): Promise<boolean> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash('sha256').update(buffer).digest('hex');
    const existing = await prisma.mediaAsset.findFirst({
      where: { siteId, metadata: { path: ['hash'], equals: hash } },
    });
    return !!existing;
  },

  async trackUsage(
    assetId: string,
    contextType: string,
    contextId: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'media.used',
        resourceType: contextType,
        resourceId: contextId,
        changes: { assetId },
      },
    });
  },

  async getUsage(assetId: string): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: {
        action: 'media.used',
        changes: { path: ['assetId'], equals: assetId },
      },
    });
  },

  async backup(siteId: string): Promise<string> {
    const assets = await prisma.mediaAsset.findMany({ where: { siteId } });
    const backupId = `media-backup-${Date.now()}`;
    await prisma.backup.create({
      data: {
        siteId,
        file: JSON.stringify(assets),
        type: 'media',
        createdBy: 'system',
      },
    });
    return backupId;
  },

  async purgeCDN(assetId: string): Promise<void> {
    // In production, would call CDN API to purge cache
  },
};
