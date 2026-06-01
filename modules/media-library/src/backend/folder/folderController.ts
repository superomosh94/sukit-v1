import { prisma } from '../db';

export async function listFolders(siteId: string, parentId?: string | null) {
  return prisma.folder.findMany({
    where: { siteId, parentId: parentId || null },
    orderBy: { name: 'asc' },
  });
}

export async function createFolder(
  siteId: string,
  name: string,
  parentId?: string
) {
  return prisma.folder.create({
    data: { siteId, name, parentId: parentId || null },
  });
}

export async function renameFolder(id: string, name: string) {
  return prisma.folder.update({ where: { id }, data: { name } });
}

export async function deleteFolder(id: string) {
  // Recursively delete all media in folder
  const media = await prisma.media.findMany({ where: { folderId: id } });
  await prisma.media.deleteMany({ where: { folderId: id } });
  await prisma.folder.delete({ where: { id } });
  return { deleted: media.length };
}

export async function moveFolder(id: string, parentId: string | null) {
  return prisma.folder.update({ where: { id }, data: { parentId } });
}
