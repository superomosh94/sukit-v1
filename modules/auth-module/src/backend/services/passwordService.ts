import crypto from 'crypto';
import { prisma } from './db';

export async function generateResetToken(
  email: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: { token, expiresAt },
    create: { userId: user.id, token, expiresAt },
  });

  return token;
}

export async function validateResetToken(token: string) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) return null;
  return record;
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await validateResetToken(token);
  if (!record) throw new Error('Invalid or expired token');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashed },
  });
  await prisma.passwordReset.delete({ where: { id: record.id } });
}
