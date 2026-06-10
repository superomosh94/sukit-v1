import { prisma } from '@/lib/db/prisma';
import type { ExportAdapter, Deployment } from '@sukit/core';
import { randomUUID } from 'crypto';

export const prismaExportAdapter: ExportAdapter = {
  async toStatic(siteId: string): Promise<string> {
    const exportId = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "exports" ("id", "siteId", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())`,
      exportId,
      siteId,
      'pending'
    );
    return exportId;
  },

  async toNextJS(siteId: string): Promise<string> {
    const exportId = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "exports" ("id", "siteId", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())`,
      exportId,
      siteId,
      'pending'
    );
    return exportId;
  },

  async toGitHub(siteId: string, repo: string): Promise<void> {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "exports" ("siteId", "status", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
      siteId,
      'pending'
    );
  },

  async deploy(
    siteId: string,
    provider: 'netlify' | 'vercel'
  ): Promise<Deployment> {
    const [dep] = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "deployments" ("siteId", "type", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      siteId,
      'static',
      'PENDING'
    );
    return {
      id: dep.id,
      siteId: dep.siteId,
      provider,
      status: 'pending',
      createdAt: dep.createdAt.toISOString(),
    };
  },

  async getStatus(exportId: string): Promise<string> {
    const [exp] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "exports" WHERE "id" = $1`,
      exportId
    );
    if (!exp) throw new Error('Export not found');
    return exp.status;
  },
};
