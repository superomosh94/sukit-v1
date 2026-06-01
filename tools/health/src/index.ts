import type { SukitKernel } from '@sukit/core';
import type { HealthCheckResult, CommandResult } from '../../types';

interface HealthSummary {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  uptime: number;
  timestamp: string;
}

export class HealthCheck {
  private kernel: SukitKernel;
  private startTime: number = Date.now();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  async simple(): Promise<CommandResult> {
    return {
      success: true,
      message: 'OK',
      data: { status: 'ok', timestamp: new Date().toISOString() },
    };
  }

  async liveness(): Promise<CommandResult> {
    return {
      success: true,
      message: 'Alive',
      data: {
        status: 'alive',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      },
    };
  }

  async readiness(): Promise<CommandResult> {
    const checks = await this.runAll([
      'database',
      'redis',
      'storage',
      'modules',
    ]);
    const allHealthy = checks.every((c) => c.status === 'healthy');
    return {
      success: allHealthy,
      message: allHealthy ? 'Ready' : 'Not ready',
      data: { status: allHealthy ? 'ready' : 'not ready', checks },
    };
  }

  async detailed(): Promise<HealthSummary> {
    const checks = await this.runAll([
      'database',
      'redis',
      'storage',
      'modules',
      'queue',
      'disk',
      'memory',
      'version',
    ]);
    const unhealthy = checks.filter((c) => c.status === 'unhealthy');
    const degraded = checks.filter((c) => c.status === 'degraded');
    const status =
      unhealthy.length > 0
        ? 'unhealthy'
        : degraded.length > 0
          ? 'degraded'
          : 'healthy';

    return {
      status,
      checks,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async runChecks(types: string[]): Promise<HealthCheckResult[]> {
    return this.runAll(types);
  }

  private async runAll(types: string[]): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    const checkMap: Record<string, () => Promise<HealthCheckResult>> = {
      database: () =>
        this.checkComponent('database', async () => {
          await this.kernel.storage.get('health:test');
          return true;
        }),
      redis: () =>
        this.checkComponent('redis', async () => {
          await this.kernel.cache.get('health:test');
          return true;
        }),
      storage: () =>
        this.checkComponent('storage', async () => {
          await this.kernel.storage.get('health:test');
          return true;
        }),
      modules: () => this.checkComponent('modules', async () => true),
      queue: () => this.checkComponent('queue', async () => true),
      disk: () =>
        this.checkComponent('disk', async () => {
          if (typeof process !== 'undefined' && process.memoryUsage) {
            const mem = process.memoryUsage();
            return {
              rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
              heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
              heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
            };
          }
          return 'unknown';
        }),
      memory: () =>
        this.checkComponent('memory', async () => {
          if (typeof process !== 'undefined' && process.memoryUsage) {
            const { heapUsed, heapTotal } = process.memoryUsage();
            return {
              used: `${Math.round(heapUsed / 1024 / 1024)}MB`,
              total: `${Math.round(heapTotal / 1024 / 1024)}MB`,
              percent: `${Math.round((heapUsed / heapTotal) * 100)}%`,
            };
          }
          return { used: '0MB', total: '0MB', percent: '0%' };
        }),
      version: () =>
        this.checkComponent('version', async () => {
          let version = '1.0.0';
          try {
            const pkg = await import('../../package.json');
            version = pkg.version;
          } catch {}
          return { current: version };
        }),
    };

    for (const type of types) {
      const checker = checkMap[type];
      if (checker) results.push(await checker());
    }

    return results;
  }

  async generatePrometheusMetrics(): Promise<string> {
    const summary = await this.detailed();
    const lines: string[] = [];
    lines.push(
      '# HELP sukit_health_status Health check status (1=healthy, 0=unhealthy)'
    );
    lines.push('# TYPE sukit_health_status gauge');
    for (const check of summary.checks) {
      lines.push(
        `sukit_health_status{name="${check.name}"} ${check.status === 'healthy' ? 1 : 0}`
      );
    }
    lines.push(
      '# HELP sukit_health_latency_ms Health check latency in milliseconds'
    );
    lines.push('# TYPE sukit_health_latency_ms gauge');
    for (const check of summary.checks) {
      lines.push(
        `sukit_health_latency_ms{name="${check.name}"} ${check.latency}`
      );
    }
    lines.push('# HELP sukit_health_uptime_seconds System uptime in seconds');
    lines.push('# TYPE sukit_health_uptime_seconds counter');
    lines.push(`sukit_health_uptime_seconds ${summary.uptime}`);
    lines.push('# HELP sukit_health_timestamp Last health check timestamp');
    lines.push('# TYPE sukit_health_timestamp gauge');
    lines.push(`sukit_health_timestamp ${Date.now()}`);
    return lines.join('\n');
  }

  private async checkComponent(
    name: string,
    check: () => Promise<any>
  ): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const details = await check();
      return {
        name,
        status: 'healthy',
        latency: Date.now() - start,
        details: typeof details === 'object' ? details : undefined,
        lastChecked: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        name,
        status: 'unhealthy',
        latency: Date.now() - start,
        error: err.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}
