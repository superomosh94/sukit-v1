import { prisma } from '@/lib/db/prisma';

export interface TaskPayload {
  name: string;
  data: any;
  priority?: 'low' | 'normal' | 'high';
  delay?: number;
  retries?: number;
  timeout?: number;
  unique?: boolean;
  cron?: string;
  dependencies?: string[];
}

export const taskService = {
  async enqueue(payload: TaskPayload): Promise<string> {
    if (payload.unique) {
      const existing = await prisma.cronJob.findFirst({
        where: { name: payload.name, status: 'PENDING' },
      });
      if (existing) return existing.id;
    }
    const job = await prisma.cronJob.create({
      data: {
        name: payload.name,
        hook: payload.name,
        args: payload.data ?? {},
        status: 'PENDING',
        schedule: payload.cron ?? null,
        retries: 0,
        maxRetries: payload.retries ?? 3,
      },
    });
    if (payload.delay && payload.delay > 0) {
      await prisma.cronJob.update({
        where: { id: job.id },
        data: { nextRun: new Date(Date.now() + payload.delay) },
      });
    }
    return job.id;
  },

  async processNext(): Promise<string | null> {
    const job = await prisma.cronJob.findFirst({
      where: { status: 'PENDING', nextRun: { lte: new Date() } },
      orderBy: { createdAt: 'asc' },
    });
    if (!job) return null;
    await prisma.cronJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', lastRun: new Date() },
    });
    return job.id;
  },

  async complete(taskId: string): Promise<void> {
    await prisma.cronJob.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' },
    });
  },

  async fail(taskId: string, error: string): Promise<void> {
    const job = await prisma.cronJob.findUnique({ where: { id: taskId } });
    if (!job) return;

    const retries = job.retries + 1;
    if (retries < job.maxRetries) {
      await prisma.cronJob.update({
        where: { id: taskId },
        data: {
          status: 'PENDING',
          retries,
          error,
          nextRun: new Date(Date.now() + Math.pow(2, retries) * 1000),
        },
      });
    } else {
      await prisma.cronJob.update({
        where: { id: taskId },
        data: { status: 'FAILED', error },
      });
    }
  },

  async getQueueMetrics(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    avgProcessingTime: number;
  }> {
    const [pending, running, completed, failed] = await Promise.all([
      prisma.cronJob.count({ where: { status: 'PENDING' } }),
      prisma.cronJob.count({ where: { status: 'RUNNING' } }),
      prisma.cronJob.count({ where: { status: 'COMPLETED' } }),
      prisma.cronJob.count({ where: { status: 'FAILED' } }),
    ]);
    return { pending, running, completed, failed, avgProcessingTime: 0 };
  },

  async getLogs(taskId: string): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: { resourceType: 'task', resourceId: taskId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async retry(taskId: string): Promise<boolean> {
    const job = await prisma.cronJob.findUnique({ where: { id: taskId } });
    if (!job || job.status !== 'FAILED') return false;
    await prisma.cronJob.update({
      where: { id: taskId },
      data: { status: 'PENDING', retries: 0, error: null, nextRun: new Date() },
    });
    return true;
  },

  async cancel(taskId: string): Promise<boolean> {
    await prisma.cronJob.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' },
    });
    return true;
  },

  async batch(operations: TaskPayload[]): Promise<string[]> {
    const ids: string[] = [];
    for (const op of operations) {
      ids.push(await this.enqueue(op));
    }
    return ids;
  },
};
