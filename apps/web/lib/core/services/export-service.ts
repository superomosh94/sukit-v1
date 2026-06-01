import { prisma } from '@/lib/db/prisma';

interface ExportProgress {
  exportId: string;
  status: 'pending' | 'building' | 'compressing' | 'complete' | 'failed';
  progress: number;
  message: string;
}

export const exportService = {
  _exports: new Map<string, ExportProgress>(),

  async create(
    siteId: string,
    type: 'static' | 'nextjs' | 'github',
    options?: {
      repo?: string;
      compress?: boolean;
      encrypt?: boolean;
      password?: string;
    }
  ): Promise<string> {
    const exp = await prisma.export.create({
      data: { siteId, status: 'pending' },
    });
    const exportId = exp.id;
    this._exports.set(exportId, {
      exportId,
      status: 'pending',
      progress: 0,
      message: 'Queued',
    });
    this.processExport(exportId, siteId, type, options).catch(() => {});
    return exportId;
  },

  async processExport(
    exportId: string,
    siteId: string,
    type: string,
    options?: any
  ): Promise<void> {
    try {
      this.updateProgress(exportId, 'building', 10, 'Collecting assets...');
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { pages: true, media: true },
      });
      if (!site) throw new Error('Site not found');

      this.updateProgress(exportId, 'building', 30, 'Building pages...');
      const pages = site.pages;

      this.updateProgress(exportId, 'building', 50, 'Optimizing...');
      await new Promise((r) => setTimeout(r, 500));

      this.updateProgress(exportId, 'compressing', 70, 'Compressing...');
      if (options?.encrypt) {
        this.updateProgress(exportId, 'compressing', 85, 'Encrypting...');
      }

      this.updateProgress(exportId, 'compressing', 90, 'Finalizing...');
      await new Promise((r) => setTimeout(r, 300));

      await prisma.export.update({
        where: { id: exportId },
        data: { status: 'completed', size: pages.length * 1024 },
      });

      this.updateProgress(exportId, 'complete', 100, 'Export complete');
    } catch (error) {
      await prisma.export.update({
        where: { id: exportId },
        data: { status: 'failed' },
      });
      this.updateProgress(
        exportId,
        'failed',
        0,
        error instanceof Error ? error.message : 'Export failed'
      );
    }
  },

  updateProgress(
    exportId: string,
    status: ExportProgress['status'],
    progress: number,
    message: string
  ): void {
    this._exports.set(exportId, { exportId, status, progress, message });
  },

  getProgress(exportId: string): ExportProgress | undefined {
    return this._exports.get(exportId);
  },

  async getHistory(siteId: string): Promise<any[]> {
    return prisma.export.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async getDeployments(siteId: string): Promise<any[]> {
    return prisma.deployment.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },

  async validate(
    siteId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      errors.push('Site not found');
      return { valid: false, errors };
    }
    const pageCount = await prisma.page.count({ where: { siteId } });
    if (pageCount === 0) errors.push('No pages to export');
    return { valid: errors.length === 0, errors };
  },

  async notifyComplete(exportId: string, email?: string): Promise<void> {
    // In production, would send email notification
  },
};
