import type { Task, ScheduledTask, TaskStatus } from "../types";

export interface TasksAdapter {
  enqueue<T>(task: Task<T>): Promise<string>;
  schedule<T>(task: ScheduledTask<T>): Promise<string>;
  getStatus(taskId: string): Promise<TaskStatus>;
  cancel(taskId: string): Promise<boolean>;
}

let _adapter: TasksAdapter | null = null;

export function setTasksAdapter(adapter: TasksAdapter): void {
  _adapter = adapter;
}

export function createTasksAPI(adapter?: TasksAdapter) {
  const a = () => adapter ?? _adapter;
  if (!a()) throw new Error("Tasks adapter not configured.");

  return {
    async enqueue<T>(task: Task<T>): Promise<string> {
      return a()!.enqueue(task);
    },

    async schedule<T>(task: ScheduledTask<T>): Promise<string> {
      return a()!.schedule(task);
    },

    async status(taskId: string): Promise<TaskStatus> {
      return a()!.getStatus(taskId);
    },

    async cancel(taskId: string): Promise<boolean> {
      return a()!.cancel(taskId);
    },
  };
}

export type TasksAPI = ReturnType<typeof createTasksAPI>;
