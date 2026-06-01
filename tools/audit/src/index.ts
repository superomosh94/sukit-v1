import type { SukitKernel } from '@sukit/core';
import type { AuditEvent, AuditFilters, AuditLog } from '../../types';

interface StoredAuditEvent extends AuditEvent {
  id: string;
  timestamp: Date;
}

interface ComplianceReport {
  period: { start: string; end: string };
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByResource: Record<string, number>;
  uniqueUsers: number;
  uniqueIPs: number;
  dataRetentionDays: number;
  immutable: boolean;
}

export class AuditLogger {
  private kernel: SukitKernel;
  private buffer: StoredAuditEvent[] = [];
  private storage: StoredAuditEvent[] = [];
  private retentionDays: number = 90;
  private forwardingUrl?: string;
  private immutableMode: boolean = true;

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
    const immutable = await this.kernel.settings.get('audit:immutable');
    if (immutable) this.immutableMode = immutable === 'true';
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

    await this.kernel.events.emit('audit:logged', { entry });
  }

  async search(
    filters: AuditFilters
  ): Promise<{ logs: AuditEvent[]; total: number }> {
    const source = this.storage.length > 0 ? this.storage : this.buffer;
    let results = [...source, ...this.buffer];
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

  async setImmutable(enabled: boolean): Promise<void> {
    this.immutableMode = enabled;
    await this.kernel.settings.set('audit:immutable', String(enabled));
  }

  async getStats(): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsByResource: Record<string, number>;
    oldestEvent: string | null;
    newestEvent: string | null;
  }> {
    const source = this.storage.length > 0 ? this.storage : this.buffer;
    const logs = [...source, ...this.buffer];
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

  async generateComplianceReport(period?: {
    start: string;
    end: string;
  }): Promise<ComplianceReport> {
    const start = period?.start
      ? new Date(period.start)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = period?.end ? new Date(period.end) : new Date();
    const source = this.storage.length > 0 ? this.storage : this.buffer;
    const logs = [...source, ...this.buffer].filter(
      (l) => l.timestamp >= start && l.timestamp <= end
    );
    const eventsByAction: Record<string, number> = {};
    const eventsByResource: Record<string, number> = {};
    const users = new Set<string>();
    const ips = new Set<string>();
    for (const l of logs) {
      eventsByAction[l.action] = (eventsByAction[l.action] || 0) + 1;
      eventsByResource[l.resourceType] =
        (eventsByResource[l.resourceType] || 0) + 1;
      if (l.userId) users.add(l.userId);
      if (l.ipAddress) ips.add(l.ipAddress);
    }
    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      totalEvents: logs.length,
      eventsByAction,
      eventsByResource,
      uniqueUsers: users.size,
      uniqueIPs: ips.size,
      dataRetentionDays: this.retentionDays,
      immutable: this.immutableMode,
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

  /** Immutable: stored entries cannot be modified or deleted */
  async deleteEntry(entryId: string): Promise<boolean> {
    if (this.immutableMode) return false;
    const before = this.storage.length;
    this.storage = this.storage.filter((e) => e.id !== entryId);
    this.buffer = this.buffer.filter((e) => e.id !== entryId);
    return this.storage.length < before || this.buffer.length < before;
  }

  private async flush(): Promise<void> {
    this.storage.push(...this.buffer);
    if (this.storage.length > 10000) this.storage = this.storage.slice(-10000);
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
      const before = this.storage.length;
      this.storage = this.storage.filter((e) => e.timestamp > cutoff);
      this.buffer = this.buffer.filter((e) => e.timestamp > cutoff);
    }, 3600000);
  }
}
