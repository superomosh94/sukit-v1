import type { ModuleLogger } from "../types";

export function createLogAPI(moduleId?: string): ModuleLogger {
  const prefix = moduleId ? `[${moduleId}]` : "[Kernel]";

  return {
    debug(message: string, meta?: any): void {
      console.debug(`${prefix} ${message}`, meta ?? "");
    },

    info(message: string, meta?: any): void {
      console.info(`${prefix} ${message}`, meta ?? "");
    },

    warn(message: string, meta?: any): void {
      console.warn(`${prefix} ${message}`, meta ?? "");
    },

    error(message: string, error?: Error): void {
      console.error(`${prefix} ${message}`, error ?? "");
    },

    forModule(moduleId: string): ModuleLogger {
      return createLogAPI(moduleId);
    },
  };
}

export type LogAPI = ReturnType<typeof createLogAPI>;
