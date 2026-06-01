import { prisma } from '@/lib/db/prisma';
import type { ExportAdapter, Deployment } from '@sukit/core';
import { randomUUID } from 'crypto';

export const prismaExportAdapter: ExportAdapter = {
  async toStatic(siteId: string): Promise<string> {
    const exportId = randomUUID();
    await prisma.export.create({
      data: { siteId, status: 'pending', id: exportId },
    });
    return exportId;
  },

  async toNextJS(siteId: string): Promise<string> {
    const exportId = randomUUID();
    await prisma.export.create({
      data: { siteId, status: 'pending', id: exportId },
    });
    return exportId;
  },

  async toGitHub(siteId: string, repo: string): Promise<void> {
    await prisma.export.create({
      data: { siteId, status: 'pending' },
    });
  },

  async deploy(
    siteId: string,
    provider: 'netlify' | 'vercel'
  ): Promise<Deployment> {
    const dep = await prisma.deployment.create({
      data: { siteId, type: 'static', status: 'PENDING' },
    });
    return {
      id: dep.id,
      siteId: dep.siteId,
      provider,
      status: 'pending',
      createdAt: dep.createdAt.toISOString(),
    };
  },

  async getStatus(exportId: string): Promise<string> {
    const exp = await prisma.export.findUniqueOrThrow({
      where: { id: exportId },
    });
    return exp.status;
  },
};
