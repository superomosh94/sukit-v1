import { prisma } from './db';

export async function createConversation(
  userId: string,
  siteId: string,
  title?: string
) {
  return prisma.chatConversation.create({
    data: { userId, siteId, title: title || 'New conversation' },
  });
}

export async function listConversations(userId: string, siteId: string) {
  return prisma.chatConversation.findMany({
    where: { userId, siteId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  });
}

export async function getConversation(id: string) {
  return prisma.chatConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function sendMessage(
  conversationId: string,
  content: string,
  role: string,
  model?: string
) {
  const message = await prisma.chatMessage.create({
    data: { conversationId, content, role, model },
  });

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function deleteConversation(id: string) {
  await prisma.chatMessage.deleteMany({ where: { conversationId: id } });
  await prisma.chatConversation.delete({ where: { id } });
}
