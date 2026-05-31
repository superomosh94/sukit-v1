import { Worker, Job } from 'bullmq';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';

interface ExportJobData {
  siteId: string;
  pageIds: string[];
}

export const exportWorker = new Worker<ExportJobData>(
  'sukit-exports',
  async (job: Job<ExportJobData>) => {
    const { siteId, pageIds } = job.data;
    logger.info(`Starting export for site ${siteId}`, { jobId: job.id });

    await job.updateProgress(10);

    const exportDir = join(process.env.EXPORT_PATH || './exports', siteId);
    const zipPath = join(exportDir, `${siteId}-export.zip`);

    const fs = await import('fs/promises');
    await fs.mkdir(exportDir, { recursive: true });

    await job.updateProgress(30);

    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i];
      const html = `<html><body><h1>Page ${pageId}</h1><p>Export placeholder</p></body></html>`;
      archive.append(html, { name: `pages/${pageId}.html` });
      const progress = 30 + Math.round(((i + 1) / pageIds.length) * 60);
      await job.updateProgress(progress);
    }

    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    await job.updateProgress(100);

    logger.info(`Export complete for site ${siteId}`, { zipPath, jobId: job.id });
    return { zipPath, size: archive.pointer() };
  },
  { connection: getRedis() }
);

exportWorker.on('completed', (job) => {
  logger.info(`Export job completed`, { jobId: job.id });
});

exportWorker.on('failed', (job, err) => {
  logger.error(`Export job failed`, { jobId: job?.id, error: err.message });
});
