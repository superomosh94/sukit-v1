import { prisma } from '../db';
import { putObject, deleteObject, getSignedUrl } from '../services/storage';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  siteId: string,
  folderId?: string,
  userId?: string
): Promise<UploadResult> {
  const ext = path.extname(filename);
  const key = `media/${siteId}/${crypto.randomUUID()}${ext}`;
  const { url } = await putObject(key, file, mimeType);

  const media = await prisma.media.create({
    data: {
      siteId,
      filename,
      mimeType,
      size: file.length,
      key,
      url,
      folderId: folderId || null,
      uploadedById: userId || null,
    },
  });

  return {
    id: media.id,
    url: media.url,
    filename: media.filename,
    mimeType: media.mimeType,
    size: media.size,
  };
}

export async function listMedia(
  siteId: string,
  folderId?: string,
  page = 1,
  limit = 50
) {
  const where: any = { siteId };
  if (folderId) where.folderId = folderId;

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { folder: true, tags: true },
    }),
    prisma.media.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getMedia(id: string) {
  return prisma.media.findUnique({
    where: { id },
    include: { folder: true, tags: true, versions: true },
  });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error('Media not found');
  await deleteObject(media.key);
  await prisma.media.delete({ where: { id } });
}

export async function bulkDelete(ids: string[]) {
  const items = await prisma.media.findMany({ where: { id: { in: ids } } });
  await Promise.all(items.map((item) => deleteObject(item.key)));
  await prisma.media.deleteMany({ where: { id: { in: ids } } });
}

export async function updateMedia(
  id: string,
  data: {
    filename?: string;
    alt?: string;
    caption?: string;
    folderId?: string | null;
  }
) {
  return prisma.media.update({ where: { id }, data });
}

export async function searchMedia(
  siteId: string,
  query: string,
  page = 1,
  limit = 50
) {
  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where: {
        siteId,
        OR: [
          { filename: { contains: query, mode: 'insensitive' } },
          { alt: { contains: query, mode: 'insensitive' } },
          { caption: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.media.count({
      where: {
        siteId,
        OR: [
          { filename: { contains: query, mode: 'insensitive' } },
          { alt: { contains: query, mode: 'insensitive' } },
          { caption: { contains: query, mode: 'insensitive' } },
        ],
      },
    }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}
