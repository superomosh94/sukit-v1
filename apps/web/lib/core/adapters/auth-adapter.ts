import { prisma } from '@/lib/db/prisma';
import type { AuthAdapter, Session, User, Invitation } from '@sukit/core';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

function toSession(s: {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}): Session {
  return {
    userId: s.userId,
    token: s.sessionToken,
    expiresAt: s.expires.toISOString(),
  };
}

function toUser(u: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? undefined,
    avatar: u.image ?? undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export const prismaAuthAdapter: AuthAdapter = {
  async login(email: string, password: string): Promise<Session> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await compare(password, user.hashedPassword);
    if (!valid) throw new Error('Invalid credentials');
    const token = randomBytes(48).toString('hex');
    const session = await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return toSession(session);
  },

  async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  },

  async getUser(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? toUser(user) : null;
  },

  async createUser(
    email: string,
    password: string,
    name?: string
  ): Promise<User> {
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, hashedPassword, name: name ?? null },
    });
    return toUser(user);
  },

  async assignRole(
    userId: string,
    siteId: string,
    role: string
  ): Promise<void> {
    await prisma.siteRoleAssignment.upsert({
      where: { userId_siteId: { userId, siteId } },
      update: { role },
      create: { userId, siteId, role },
    });
  },

  async getUserRole(userId: string, siteId: string): Promise<string | null> {
    const assignment = await prisma.siteRoleAssignment.findUnique({
      where: { userId_siteId: { userId, siteId } },
    });
    return assignment?.role ?? null;
  },

  async inviteUser(
    siteId: string,
    email: string,
    role: string
  ): Promise<Invitation> {
    const token = randomBytes(32).toString('hex');
    return {
      id: token.slice(0, 12),
      siteId,
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async getSession(token: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });
    if (!session || session.expires < new Date()) return null;
    return toSession(session);
  },
};
