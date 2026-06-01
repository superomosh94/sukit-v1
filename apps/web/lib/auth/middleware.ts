import { auth } from './auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';
import { prisma } from '@/lib/db/prisma';

export const protectedRoutes = [
  '/dashboard',
  '/builder',
  '/api/sites',
  '/api/pages',
  '/api/export',
  '/settings',
  '/sites',
  '/modules',
];

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user as { role?: string }).role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  return session;
}

export async function requireDeveloper() {
  const session = await requireAuth();
  const userId = (session.user as { id?: string }).id;
  if (!userId) throw new UnauthorizedError('Authentication required');

  const developer = await prisma.developer.findUnique({
    where: { userId },
  });
  if (!developer) {
    throw new ForbiddenError('Developer registration required');
  }
  if (developer.status !== 'approved' && developer.status !== 'active') {
    throw new ForbiddenError(`Developer status: ${developer.status}`);
  }
  return { session, developer };
}

export async function getOptionalDeveloper(userId: string) {
  return prisma.developer.findUnique({ where: { userId } });
}

export async function getOptionalAuth() {
  const session = await auth();
  return session;
}
