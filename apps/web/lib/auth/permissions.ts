import type { User } from "next-auth";

export function isOwner(user: User, resourceUserId: string): boolean {
  return user.id === resourceUserId;
}

export function canEdit(user: User, resourceUserId: string): boolean {
  return isOwner(user, resourceUserId) || canAdmin(user);
}

export function canView(
  user: User | null,
  resourceUserId: string,
  isPublished: boolean = true,
): boolean {
  if (isPublished && !user) return true;
  if (!user) return false;
  return isOwner(user, resourceUserId) || canAdmin(user);
}

export function canAdmin(user: User): boolean {
  return (user as { role?: string }).role === "admin";
}
