import { prisma } from '../db';

export async function getTags(siteId: string) {
  return prisma.tag.findMany({
    where: { siteId },
    include: { _count: { select: { media: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function createTag(siteId: string, name: string) {
  return prisma.tag.upsert({
    where: { siteId_name: { siteId, name } },
    update: {},
    create: { siteId, name },
  });
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
}

export async function tagMedia(mediaId: string, tagIds: string[]) {
  await prisma.media.update({
    where: { id: mediaId },
    data: { tags: { set: tagIds.map((id) => ({ id })) } },
  });
}
