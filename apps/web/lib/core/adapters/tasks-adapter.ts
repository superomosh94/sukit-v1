import { prisma } from '@/lib/db/prisma';
import type {
  TasksAdapter,
  Task,
  ScheduledTask,
  TaskStatus,
} from '@sukit/core';

export const prismaTasksAdapter: TasksAdapter = {
  async enqueue<T>(task: Task<T>): Promise<string> {
    const job = await prisma.cronJob.create({
      data: {
        name: task.name,
        hook: task.name,
        args: task.data ?? {},
        status: 'PENDING',
        schedule: null,
        retries: task.options?.retries ?? 0,
        maxRetries: task.options?.retries ?? 3,
      },
    });
    return job.id;
  },

  async schedule<T>(task: ScheduledTask<T>): Promise<string> {
    const job = await prisma.cronJob.create({
      data: {
        name: task.name,
        hook: task.name,
        args: task.data ?? {},
        status: 'PENDING',
        schedule: task.cron,
        retries: task.options?.retries ?? 0,
        maxRetries: task.options?.retries ?? 3,
      },
    });
    return job.id;
  },

  async getStatus(taskId: string): Promise<TaskStatus> {
    const job = await prisma.cronJob.findUniqueOrThrow({
      where: { id: taskId },
    });
    const map: Record<string, TaskStatus> = {
      PENDING: 'pending',
      RUNNING: 'running',
      COMPLETED: 'completed',
      FAILED: 'failed',
    };
    return map[job.status] ?? 'pending';
  },

  async cancel(taskId: string): Promise<boolean> {
    await prisma.cronJob.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' },
    });
    return true;
  },
};
