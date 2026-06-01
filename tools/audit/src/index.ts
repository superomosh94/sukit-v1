import type { SukitKernel } from '@sukit/core';
import type { AuditEvent, AuditFilters, AuditLog } from '../../types';

interface StoredAuditEvent extends AuditEvent {
  id: string;
  timestamp: Date;
}

export class AuditLogger {
  private kernel: SukitKernel;
  private buffer: StoredAuditEvent[] = [];
  private retentionDays: number = 90;
  private forwardingUrl?: string;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.loadConfig();
    this.startMaintenance();
  }

  private async loadConfig(): Promise<void> {
    const retention = await this.kernel.settings.get('audit:retention-days');
    if (retention) this.retentionDays = parseInt(retention as string);
    const forwarding = await this.kernel.settings.get('audit:forwarding-url');
    if (forwarding) this.forwardingUrl = forwarding as string;
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const entry: StoredAuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event,
    };

    this.buffer.push(entry);
    if (this.buffer.length >= 100) await this.flush();

    if (this.forwardingUrl) {
      this.forward(entry).catch(() => {});
    }
  }

  async search(
    filters: AuditFilters
  ): Promise<{ logs: AuditEvent[]; total: number }> {
    let results = this.buffer;
    if (filters.userId)
      results = results.filter((l) => l.userId === filters.userId);
    if (filters.action)
      results = results.filter((l) => l.action === filters.action);
    if (filters.resourceType)
      results = results.filter((l) => l.resourceType === filters.resourceType);
    if (filters.resourceId)
      results = results.filter((l) => l.resourceId === filters.resourceId);
    if (filters.ipAddress)
      results = results.filter((l) => l.ipAddress === filters.ipAddress);
    if (filters.startDate)
      results = results.filter(
        (l) => l.timestamp >= new Date(filters.startDate!)
      );
    if (filters.endDate)
      results = results.filter(
        (l) => l.timestamp <= new Date(filters.endDate!)
      );

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const total = results.length;
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    return { logs: results.slice(offset, offset + limit), total };
  }

  async export(format: 'csv' | 'json', filters: AuditFilters): Promise<string> {
    const { logs } = await this.search(filters);

    if (format === 'json') return JSON.stringify(logs, null, 2);

    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'IP Address',
      'Changes',
    ];
    const rows = logs.map((l) =>
      [
        l.timestamp instanceof Date ? l.timestamp.toISOString() : l.timestamp,
        l.userId || 'system',
        l.action,
        l.resourceType,
        l.resourceId || '',
        l.ipAddress || '',
        l.changes ? JSON.stringify(l.changes).replace(/"/g, '""') : '',
      ]
        .map((v) => `"${v}"`)
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  async setRetention(days: number): Promise<void> {
    this.retentionDays = days;
    await this.kernel.settings.set('audit:retention-days', String(days));
  }

  async getStats(): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByResource: Record<string, number>;
    oldestEvent: string | null;
    newestEvent: string | null;
  }> {
    const logs = this.buffer;
    const eventsByAction: Record<string, number> = {};
    const eventsByResource: Record<string, number> = {};
    for (const l of logs) {
      eventsByAction[l.action] = (eventsByAction[l.action] || 0) + 1;
      eventsByResource[l.resourceType] =
        (eventsByResource[l.resourceType] || 0) + 1;
    }
    return {
      totalEvents: logs.length,
      eventsByAction,
      eventsByResource,
      oldestEvent:
        logs.length > 0 ? logs[logs.length - 1].timestamp.toISOString() : null,
      newestEvent: logs.length > 0 ? logs[0].timestamp.toISOString() : null,
    };
  }

  middleware() {
    return async (req: any, res: any, next: () => void) => {
      const start = Date.now();
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        this.log({
          userId: req.user?.id || null,
          action: `${req.method} ${req.path}`,
          resourceType: req.path?.split('/')[2] || 'unknown',
          resourceId: req.params?.id || null,
          changes: { statusCode: res.statusCode, duration: Date.now() - start },
          ipAddress: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers?.['user-agent'] || null,
          sessionId: req.session?.id || null,
        });
        originalEnd.apply(res, args);
      };
      next();
    };
  }

  private async flush(): Promise<void> {
    // In production, persist buffer to database
    this.buffer = [];
  }

  private async forward(entry: StoredAuditEvent): Promise<void> {
    if (!this.forwardingUrl) return;
    await fetch(this.forwardingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });
  }

  private startMaintenance(): void {
    setInterval(() => {
      const cutoff = new Date(
        Date.now() - this.retentionDays * 24 * 60 * 60 * 1000
      );
      const before = this.buffer.length;
      this.buffer = this.buffer.filter((e) => e.timestamp > cutoff);
    }, 3600000);
  }
}
