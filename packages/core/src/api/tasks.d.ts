import type { Task, ScheduledTask, TaskStatus } from '../types';
export interface TasksAdapter {
  enqueue<T>(task: Task<T>): Promise<string>;
  schedule<T>(task: ScheduledTask<T>): Promise<string>;
  getStatus(taskId: string): Promise<TaskStatus>;
  cancel(taskId: string): Promise<boolean>;
}
export declare function setTasksAdapter(adapter: TasksAdapter): void;
export declare function createTasksAPI(adapter?: TasksAdapter): {
  enqueue<T>(task: Task<T>): Promise<string>;
  schedule<T>(task: ScheduledTask<T>): Promise<string>;
  status(taskId: string): Promise<TaskStatus>;
  cancel(taskId: string): Promise<boolean>;
};
export type TasksAPI = ReturnType<typeof createTasksAPI>;
//# sourceMappingURL=tasks.d.ts.map
