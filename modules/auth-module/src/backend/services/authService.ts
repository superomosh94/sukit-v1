import bcrypt from 'bcryptjs';
import { prisma } from './db';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(
  email: string,
  password: string,
  name: string
) {
  const hashed = await hashPassword(password);
  return prisma.user.create({
    data: { email, password: hashed, name },
  });
}
