import type { ModuleLogger, LogEntry } from '../types';

type LogTransport = (entry: LogEntry) => void;

export function createLogAPI(moduleId?: string) {
  const prefix = moduleId ? `[${moduleId}]` : '[Kernel]';
  const transports: LogTransport[] = [];
  const buffer: LogEntry[] = [];
  const MAX_BUFFER = 1000;
  let retentionDays = 30;
  let samplingRate = 1;

  const log = (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta?: any
  ) => {
    if (level === 'debug' && Math.random() > samplingRate) return;

    const entry: LogEntry = {
      level,
      message,
      meta,
      moduleId,
      timestamp: Date.now(),
      traceId: (meta as any)?.traceId,
    };

    buffer.push(entry);
    if (buffer.length > MAX_BUFFER) buffer.shift();

    const consoleFn =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'info'
            ? console.info
            : console.debug;
    consoleFn(`${prefix} ${message}`, meta ?? '');

    for (const transport of transports) {
      try {
        transport(entry);
      } catch {
        /* ignore transport errors */
      }
    }
  };

  return {
    debug(message: string, meta?: any): void {
      log('debug', message, meta);
    },
    info(message: string, meta?: any): void {
      log('info', message, meta);
    },
    warn(message: string, meta?: any): void {
      log('warn', message, meta);
    },
    error(message: string, error?: Error): void {
      log('error', message, { error: error?.message, stack: error?.stack });
    },

    forModule(mid: string): ModuleLogger {
      return createLogAPI(mid) as ModuleLogger;
    },

    addTransport(transport: LogTransport): void {
      transports.push(transport);
    },

    removeTransport(transport: LogTransport): void {
      const idx = transports.indexOf(transport);
      if (idx >= 0) transports.splice(idx, 1);
    },

    setRetention(days: number): void {
      retentionDays = days;
    },

    query(options?: {
      level?: string;
      moduleId?: string;
      since?: number;
      until?: number;
    }): LogEntry[] {
      let results = [...buffer];
      if (options?.level)
        results = results.filter((e) => e.level === options.level);
      if (options?.moduleId)
        results = results.filter((e) => e.moduleId === options.moduleId);
      if (options?.since)
        results = results.filter((e) => e.timestamp >= options.since!);
      if (options?.until)
        results = results.filter((e) => e.timestamp <= options.until!);
      return results;
    },

    setSamplingRate(rate: number): void {
      samplingRate = Math.max(0, Math.min(1, rate));
    },

    /** Compression */
    async compress(): Promise<Buffer> {
      const data = JSON.stringify(buffer);
      return Buffer.from(data);
    },

    /** Forwarding */
    async forward(
      url: string,
      options?: { headers?: Record<string, string> }
    ): Promise<void> {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...options?.headers },
          body: JSON.stringify(buffer.slice(-100)),
        });
      } catch (error) {
        console.error('[Log] Forward failed:', error);
      }
    },
  };
}

export type LogAPI = ReturnType<typeof createLogAPI>;
