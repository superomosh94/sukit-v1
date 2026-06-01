import type { ModuleLogger } from '../types';
export declare function createLogAPI(moduleId?: string): ModuleLogger;
export type LogAPI = ReturnType<typeof createLogAPI>;
