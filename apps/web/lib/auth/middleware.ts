import { auth } from "./auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/errors";

export const protectedRoutes = [
  "/dashboard",
  "/builder",
  "/api/sites",
  "/api/pages",
  "/api/export",
  "/settings",
  "/sites",
  "/modules",
];

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user as { role?: string }).role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

export async function getOptionalAuth() {
  const session = await auth();
  return session;
}
