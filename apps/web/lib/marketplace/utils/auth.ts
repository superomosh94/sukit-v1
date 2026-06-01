import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'developer';
};

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const id = (session.user as { id?: string }).id;
  if (!id) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || dbUser.email,
    role: (dbUser.role as AuthUser['role']) || 'user',
  };
}

export async function requireUser(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    const err: any = new Error('Authentication required');
    err.name = 'UnauthorizedError';
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdminUser(req: NextRequest): Promise<AuthUser> {
  const user = await requireUser(req);
  if (user.role !== 'admin') {
    const err: any = new Error('Admin access required');
    err.name = 'ForbiddenError';
    err.status = 403;
    throw err;
  }
  return user;
}
