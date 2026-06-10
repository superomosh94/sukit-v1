import { prisma } from '@/lib/db/prisma';
import type { MediaAdapter, MediaAsset, ImageOptions } from '@sukit/core';
import { randomUUID } from 'crypto';

function toAsset(a: any): MediaAsset {
  return {
    id: a.id,
    siteId: a.siteId,
    filename: a.filename,
    mimeType: a.mimeType,
    size: a.size,
    width: a.width ?? undefined,
    height: a.height ?? undefined,
    url: a.url,
    createdAt: a.createdAt.toISOString(),
  };
}

export const prismaMediaAdapter: MediaAdapter = {
  async upload(file: any, siteId: string): Promise<MediaAsset> {
    const filename =
      file instanceof File ? file.name : `upload-${randomUUID()}`;
    const mimeType =
      file instanceof File ? file.type : 'application/octet-stream';
    const size = file instanceof File ? file.size : 0;
    const url = `/uploads/${siteId}/${filename}`;
    const asset = await prisma.mediaAsset.create({
      data: {
        siteId,
        filename,
        originalName: filename,
        mimeType,
        size,
        uploadedBy: 'system',
      },
    });
    return toAsset(asset);
  },

  async get(id: string): Promise<MediaAsset> {
    const asset = await prisma.mediaAsset.findUniqueOrThrow({ where: { id } });
    return toAsset(asset);
  },

  async list(siteId: string): Promise<MediaAsset[]> {
    const assets = await prisma.mediaAsset.findMany({
      where: { siteId, trashedAt: null },
      orderBy: { uploadedAt: 'desc' },
    });
    return assets.map(toAsset);
  },

  async delete(id: string): Promise<void> {
    await prisma.mediaAsset.update({
      where: { id },
      data: { trashedAt: new Date() },
    });
  },

  getUrl(id: string, options?: ImageOptions): string {
    return `/api/media/${id}${options ? `?w=${options.width ?? ''}&q=${options.quality ?? ''}` : ''}`;
  },
};
