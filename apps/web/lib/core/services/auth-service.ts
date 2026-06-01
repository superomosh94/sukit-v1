import { prisma } from '@/lib/db/prisma';
import { randomBytes, randomInt } from 'crypto';
import { hash, compare } from 'bcryptjs';

const ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;

interface RoleDefinition {
  name: string;
  permissions: string[];
  inherits?: string;
}

const ROLE_DEFINITIONS: RoleDefinition[] = [
  { name: 'owner', permissions: ['*'] },
  {
    name: 'admin',
    permissions: [
      'site.*',
      'pages.*',
      'media.*',
      'settings.*',
      'users.invite',
      'users.manage',
    ],
  },
  {
    name: 'editor',
    permissions: ['pages.*', 'media.*', 'pages.publish'],
    inherits: 'viewer',
  },
  { name: 'viewer', permissions: ['site.read', 'pages.read', 'media.read'] },
];

export const authService = {
  ROLES,

  getRoleDefinitions(): RoleDefinition[] {
    return ROLE_DEFINITIONS;
  },

  async getUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  async listUsers(siteId?: string): Promise<any[]> {
    if (siteId) {
      const assignments = await prisma.siteRoleAssignment.findMany({
        where: { siteId },
        include: { user: true },
      });
      return assignments.map((a) => ({ ...a.user, role: a.role }));
    }
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async updateRole(
    userId: string,
    siteId: string,
    role: string
  ): Promise<void> {
    if (!ROLES.includes(role as any)) throw new Error(`Invalid role: ${role}`);
    await prisma.siteRoleAssignment.upsert({
      where: { userId_siteId: { userId, siteId } },
      update: { role },
      create: { userId, siteId, role },
    });
  },

  async removeUser(userId: string, siteId: string): Promise<void> {
    await prisma.siteRoleAssignment.deleteMany({ where: { userId, siteId } });
  },

  async listSessions(userId: string): Promise<any[]> {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { expires: 'desc' },
    });
  },

  async revokeSession(sessionToken: string): Promise<void> {
    await prisma.session.deleteMany({ where: { sessionToken } });
  },

  async revokeAllSessions(
    userId: string,
    exceptToken?: string
  ): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        ...(exceptToken ? { sessionToken: { not: exceptToken } } : {}),
      },
    });
    return result.count;
  },

  async sendPasswordReset(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    const token = randomBytes(32).toString('hex');
    // In production, send email with reset link
    return token;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashed = await hash(newPassword, 12);
    // In production, look up token in DB
    // await prisma.user.update({ where: { id: userId }, data: { hashedPassword: hashed } });
  },

  async deleteAccount(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId } });
      await tx.siteRoleAssignment.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  },

  async lockAccount(userId: string, durationMs: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + durationMs) },
    } as any);
  },

  async checkLocked(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    const lockedUntil = (user as any).lockedUntil;
    return lockedUntil && new Date(lockedUntil) > new Date();
  },

  async generateTwoFactorSecret(
    userId: string
  ): Promise<{ secret: string; qrCodeUrl: string }> {
    // In production, use otplib to generate TOTP secret
    return { secret: randomBytes(20).toString('hex'), qrCodeUrl: '' };
  },

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    // In production, verify TOTP
    return true;
  },

  async sendVerificationEmail(email: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return token;
  },

  async verifyEmail(token: string): Promise<void> {
    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt || vt.expires < new Date())
      throw new Error('Invalid or expired token');
    await prisma.user.update({
      where: { email: vt.identifier },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.delete({ where: { token } });
  },
};
