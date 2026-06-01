import { prisma } from './db';
import crypto from 'crypto';

export async function createSession(
  userId: string,
  metadata?: Record<string, any>
) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      metadata: metadata || {},
    },
  });

  return token;
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // Rotate session
  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return session;
}

export async function revokeSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function revokeAllSessions(
  userId: string,
  excludeCurrent?: string
) {
  const where: any = { userId };
  if (excludeCurrent) where.token = { not: excludeCurrent };
  await prisma.session.deleteMany({ where });
}

export async function listActiveSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { lastUsedAt: 'desc' },
    select: { id: true, createdAt: true, lastUsedAt: true, metadata: true },
  });
}

export async function enforceConcurrentSessions(
  userId: string,
  maxSessions: number = 5
) {
  const sessions = await prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { lastUsedAt: 'desc' },
  });

  if (sessions.length > maxSessions) {
    const toDelete = sessions.slice(maxSessions);
    await prisma.session.deleteMany({
      where: { id: { in: toDelete.map((s) => s.id) } },
    });
  }
}
