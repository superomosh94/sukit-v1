import { prisma } from './db';
import { exportFullStack, exportToZip } from './export-adapter.js';

export interface ExportProgress {
  exportId: string;
  siteId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  step: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface ExportRecord extends ExportProgress {
  fileCount?: number;
  totalSize?: number;
  format: string;
}

const activeExports = new Map<string, { abort: boolean }>();

export class ExportQueue {
  async queueExport(
    siteId: string,
    format: string = 'fullstack'
  ): Promise<string> {
    const exportId = crypto.randomUUID();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "exports" ("id", "siteId", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())`,
      exportId,
      siteId,
      'pending'
    );

    activeExports.set(exportId, { abort: false });

    this.processExport(exportId, siteId, format).catch(console.error);

    return exportId;
  }

  private async processExport(
    exportId: string,
    siteId: string,
    format: string
  ): Promise<void> {
    const control = activeExports.get(exportId);
    if (!control || control.abort) return;

    try {
      await this.updateProgress(
        exportId,
        'processing',
        'Generating application...',
        10
      );

      const tree = await exportFullStack(siteId);

      await this.updateProgress(
        exportId,
        'processing',
        'Packaging files...',
        70
      );

      const buffer = await exportToZip(siteId);

      if (control.abort) return;

      await this.updateProgress(exportId, 'completed', 'Export complete', 100);

      await prisma.$executeRawUnsafe(
        `UPDATE "exports" SET "status" = $1, "size" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
        'completed',
        buffer.length,
        exportId
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      await this.updateProgress(exportId, 'failed', message, 0);
      await prisma.$executeRawUnsafe(
        `UPDATE "exports" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
        'failed',
        exportId
      );
    } finally {
      activeExports.delete(exportId);
    }
  }

  async getExportProgress(exportId: string): Promise<ExportProgress | null> {
    const [record] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "exports" WHERE "id" = $1`,
      exportId
    );

    if (!record) return null;

    return {
      exportId: record.id,
      siteId: record.siteId,
      status: this.mapStatus(record.status),
      progress:
        record.status === 'completed'
          ? 100
          : record.status === 'failed'
            ? 0
            : 50,
      step:
        record.status === 'completed'
          ? 'Complete'
          : record.status === 'failed'
            ? 'Failed'
            : 'Processing',
      error: undefined,
      completedAt: record.createdAt.toISOString(),
    };
  }

  async cancelExport(exportId: string): Promise<void> {
    const control = activeExports.get(exportId);
    if (control) {
      control.abort = true;
      activeExports.delete(exportId);
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "exports" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      'failed',
      exportId
    );
  }

  async listExports(siteId: string): Promise<ExportRecord[]> {
    const records = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "exports" WHERE "siteId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      siteId
    );

    return records.map((r: any) => ({
      exportId: r.id,
      siteId: r.siteId,
      format: 'fullstack',
      status: this.mapStatus(r.status),
      progress: r.status === 'completed' ? 100 : 0,
      step: '',
      totalSize: r.size || undefined,
      completedAt: r.createdAt.toISOString(),
    }));
  }

  private async updateProgress(
    exportId: string,
    status: string,
    step: string,
    progress: number
  ): Promise<void> {
    if (activeExports.get(exportId)?.abort) return;
  }

  private mapStatus(
    status: string
  ): 'queued' | 'processing' | 'completed' | 'failed' {
    const map: Record<
      string,
      'queued' | 'processing' | 'completed' | 'failed'
    > = {
      pending: 'queued',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
    };
    return map[status] || 'failed';
  }
}

export const exportQueue = new ExportQueue();
