import { prisma } from './db';

export interface RoleDefinition {
  name: string;
  permissions: string[];
}

const DEFAULT_ROLES: RoleDefinition[] = [
  { name: 'admin', permissions: ['*'] },
  {
    name: 'editor',
    permissions: [
      'pages:read',
      'pages:write',
      'media:read',
      'media:write',
      'modules:read',
    ],
  },
  {
    name: 'author',
    permissions: [
      'pages:read',
      'pages:write:own',
      'media:read',
      'media:write:own',
    ],
  },
  { name: 'viewer', permissions: ['pages:read'] },
];

export async function getRoles(siteId: string) {
  return prisma.role.findMany({
    where: { siteId },
    include: { _count: { select: { users: true } } },
  });
}

export async function createRole(
  siteId: string,
  name: string,
  permissions: string[]
) {
  return prisma.role.create({
    data: { siteId, name, permissions },
  });
}

export async function updateRole(
  id: string,
  data: { name?: string; permissions?: string[] }
) {
  return prisma.role.update({ where: { id }, data });
}

export async function deleteRole(id: string) {
  await prisma.role.delete({ where: { id } });
}

export async function assignRole(
  userId: string,
  roleId: string,
  siteId: string
) {
  return prisma.userRole.upsert({
    where: { userId_roleId_siteId: { userId, roleId, siteId } },
    update: {},
    create: { userId, roleId, siteId },
  });
}

export async function removeRole(
  userId: string,
  roleId: string,
  siteId: string
) {
  await prisma.userRole.delete({
    where: { userId_roleId_siteId: { userId, roleId, siteId } },
  });
}

export async function checkPermission(
  userId: string,
  siteId: string,
  permission: string
): Promise<boolean> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId, siteId },
    include: { role: true },
  });

  for (const ur of userRoles) {
    if (ur.role.permissions.includes('*')) return true;
    if (ur.role.permissions.includes(permission)) return true;
  }
  return false;
}
