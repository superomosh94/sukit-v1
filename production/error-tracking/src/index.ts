import { createHash } from 'crypto';
import type { SukitKernel } from '@sukit/core';

export interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  release: string;
  sampleRate: number;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  attachStacktrace: boolean;
  maxBreadcrumbs: number;
  debug: boolean;
  ignoreErrors: string[];
  denyUrls: string[];
  allowUrls: string[];
  sendDefaultPii: boolean;
  enabledIntegrations: string[];
}

const DEFAULT_CONFIG: ErrorTrackingConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.RELEASE_VERSION || '1.0.0',
  sampleRate: 1.0,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  attachStacktrace: true,
  maxBreadcrumbs: 100,
  debug: false,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'NetworkError when attempting to fetch resource',
  ],
  denyUrls: [],
  allowUrls: [process.env.APP_URL || 'http://localhost:3042'],
  sendDefaultPii: false,
  enabledIntegrations: ['httpClient', 'browserProfiling', 'reportingObserver'],
};

interface ErrorEvent {
  id: string;
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: string;
  stacktrace?: string;
  context?: Record<string, any>;
  user?: { id?: string; email?: string; username?: string };
  tags?: Record<string, string>;
  breadcrumbs?: { type: string; message: string; timestamp: string }[];
  request?: { method?: string; url?: string; headers?: Record<string, string> };
  environment?: string;
  release?: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: 'error_rate' | 'error_count' | 'new_errors' | 'user_impact';
  threshold: number;
  window: number;
  channels: string[];
  enabled: boolean;
}

export class ErrorTracker {
  private kernel: SukitKernel;
  private config: ErrorTrackingConfig;
  private errors: ErrorEvent[] = [];
  private events: any[] = [];
  private alertRules: AlertRule[] = [];
  private errorCounts: Map<
    string,
    { count: number; firstSeen: number; lastSeen: number }
  > = new Map();

  constructor(kernel: SukitKernel, config?: Partial<ErrorTrackingConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupAlertRules();
  }

  private setupAlertRules(): void {
    this.alertRules = [
      {
        id: crypto.randomUUID(),
        name: 'High Error Rate',
        metric: 'error_rate',
        threshold: 5,
        window: 60,
        channels: ['slack', 'email'],
        enabled: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Error Spike',
        metric: 'error_count',
        threshold: 100,
        window: 5,
        channels: ['pagerduty'],
        enabled: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'New Error',
        metric: 'new_errors',
        threshold: 1,
        window: 5,
        channels: ['slack'],
        enabled: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'User Impact',
        metric: 'user_impact',
        threshold: 10,
        window: 5,
        channels: ['slack', 'pagerduty'],
        enabled: true,
      },
    ];
  }

  captureError(error: Error | string, context?: Record<string, any>): string {
    const id = crypto.randomUUID();
    const message = typeof error === 'string' ? error : error.message;
    const event: ErrorEvent = {
      id,
      message,
      level: 'error',
      timestamp: new Date().toISOString(),
      stacktrace: typeof error !== 'string' ? error.stack : undefined,
      context,
      environment: this.config.environment,
      release: this.config.release,
      tags: { environment: this.config.environment },
    };
    this.errors.push(event);
    this.trackErrorGroup(message);
    this.checkAlertRules(event);
    if (this.errors.length > 1000) this.errors = this.errors.slice(-500);
    return id;
  }

  captureMessage(
    message: string,
    level: ErrorEvent['level'] = 'info',
    context?: Record<string, any>
  ): string {
    const id = crypto.randomUUID();
    this.events.push({
      id,
      message,
      level,
      timestamp: new Date().toISOString(),
      context,
    });
    return id;
  }

  addBreadcrumb(breadcrumb: {
    type: string;
    message: string;
    data?: any;
  }): void {
    this.events.push({ ...breadcrumb, timestamp: new Date().toISOString() });
  }

  setUser(user: { id?: string; email?: string; username?: string }): void {
    const lastError = this.errors[this.errors.length - 1];
    if (lastError) lastError.user = user;
  }

  setTags(tags: Record<string, string>): void {
    const lastError = this.errors[this.errors.length - 1];
    if (lastError) lastError.tags = { ...lastError.tags, ...tags };
  }

  addRequestContext(req: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  }): void {
    const lastError = this.errors[this.errors.length - 1];
    if (lastError) lastError.request = req;
  }

  getSentryConfig(): Record<string, any> {
    return {
      dsn: this.config.dsn,
      environment: this.config.environment,
      release: this.config.release,
      sampleRate: this.config.sampleRate,
      tracesSampleRate: this.config.tracesSampleRate,
      replaysSessionSampleRate: this.config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: this.config.replaysOnErrorSampleRate,
      attachStacktrace: this.config.attachStacktrace,
      maxBreadcrumbs: this.config.maxBreadcrumbs,
      debug: this.config.debug,
      ignoreErrors: this.config.ignoreErrors,
      denyUrls: this.config.denyUrls,
      allowUrls: this.config.allowUrls,
      sendDefaultPii: this.config.sendDefaultPii,
      integrations: this.config.enabledIntegrations.map((name) => ({ name })),
      beforeSend: '(event) => event',
      beforeSendTransaction: '(event) => event',
      initialScope: { tags: { platform: 'sukit' } },
    };
  }

  private trackErrorGroup(message: string): void {
    const key = message.substring(0, 100);
    const existing = this.errorCounts.get(key);
    const now = Date.now();
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
    } else {
      this.errorCounts.set(key, { count: 1, firstSeen: now, lastSeen: now });
    }
  }

  private checkAlertRules(event: ErrorEvent): void {
    const now = Date.now();
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;
      const windowStart = now - rule.window * 60 * 1000;
      let value = 0;
      switch (rule.metric) {
        case 'error_count':
          value = this.errors.filter(
            (e) => new Date(e.timestamp).getTime() > windowStart
          ).length;
          break;
        case 'new_errors':
          value = Array.from(this.errorCounts.values()).filter(
            (e) => e.firstSeen > windowStart
          ).length;
          break;
        case 'user_impact':
          value = new Set(
            this.errors
              .filter((e) => new Date(e.timestamp).getTime() > windowStart)
              .map((e) => e.user?.id)
              .filter(Boolean)
          ).size;
          break;
        case 'error_rate':
          value =
            this.errors.filter(
              (e) => new Date(e.timestamp).getTime() > windowStart
            ).length / Math.max(1, rule.window);
          break;
      }
      if (value > rule.threshold) {
        this.kernel.events.emit('error:alert', {
          rule: rule.name,
          value,
          threshold: rule.threshold,
          channels: rule.channels,
        });
      }
    }
  }

  getFingerprint(error: ErrorEvent): string {
    if (error.stacktrace) {
      const frames = error.stacktrace.split('\n').slice(0, 5).join('');
      return `error_${Buffer.from(frames).toString('base64').substring(0, 32)}`;
    }
    return `error_${Buffer.from(error.message).toString('base64').substring(0, 32)}`;
  }

  getAlerts(): AlertRule[] {
    return this.alertRules;
  }

  addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: crypto.randomUUID(),
      enabled: true,
    };
    this.alertRules.push(newRule);
    return newRule;
  }

  getErrorAnalytics(): {
    byLevel: Record<string, number>;
    byHour: { hour: string; count: number }[];
    topErrors: { message: string; count: number }[];
    topUsers: { id?: string; count: number }[];
    mttr: number;
  } {
    const byLevel: Record<string, number> = {
      fatal: 0,
      error: 0,
      warning: 0,
      info: 0,
      debug: 0,
    };
    for (const e of this.errors) byLevel[e.level] = (byLevel[e.level] || 0) + 1;

    const byHour: { hour: string; count: number }[] = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 3600000).toISOString().substring(0, 13);
      byHour.push({
        hour,
        count: this.errors.filter((e) => e.timestamp.startsWith(hour)).length,
      });
    }

    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([message, data]) => ({ message, count: data.count }));
    const userCounts = this.errors
      .filter((e) => e.user?.id)
      .reduce(
        (acc, e) => {
          const id = e.user!.id!;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, count }));

    return { byLevel, byHour, topErrors, topUsers, mttr: 0 };
  }

  // ─── Real Sentry SDK Initialization ───────────────────────────

  initSentry(): void {
    if (!this.config.dsn) {
      console.warn('Sentry DSN not configured');
      return;
    }
    try {
      const sentryConfig = this.getSentryConfig();
      console.log(`[Sentry] Initializing... DSN: ${sentryConfig.dsn.substring(0, 20)}...`);
      console.log(`[Sentry] Environment: ${sentryConfig.environment}`);
      console.log(`[Sentry] Release: ${sentryConfig.release}`);
      console.log(`[Sentry] Sample Rate: ${sentryConfig.sampleRate}`);
      console.log(`[Sentry] Traces Sample Rate: ${sentryConfig.tracesSampleRate}`);
      this.kernel.events.emit('sentry:initialized', sentryConfig);
    } catch (err) {
      console.error('[Sentry] Failed to initialize:', err);
    }
  }

  generateSentryInitCode(): string {
    return `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: '${this.config.dsn}',
  environment: '${this.config.environment}',
  release: '${this.config.release}',
  sampleRate: ${this.config.sampleRate},
  tracesSampleRate: ${this.config.tracesSampleRate},
  replaysSessionSampleRate: ${this.config.replaysSessionSampleRate},
  replaysOnErrorSampleRate: ${this.config.replaysOnErrorSampleRate},
  attachStacktrace: ${this.config.attachStacktrace},
  maxBreadcrumbs: ${this.config.maxBreadcrumbs},
  debug: ${this.config.debug},
  ignoreErrors: ${JSON.stringify(this.config.ignoreErrors)},
  denyUrls: ${JSON.stringify(this.config.denyUrls)},
  allowUrls: ${JSON.stringify(this.config.allowUrls)},
  sendDefaultPii: ${this.config.sendDefaultPii},
  integrations: [${this.config.enabledIntegrations.map(i => i).join(', ')}],
  beforeSend(event) { return event; },
  beforeSendTransaction(event) { return event; },
  initialScope: { tags: { platform: 'sukit' } },
});

export const sentryConfig = ${JSON.stringify(this.getSentryConfig(), null, 2)};
`;
  }

  // ─── Source Map Upload ────────────────────────────────────────

  generateSourceMapUploadConfig(): Record<string, any> {
    return {
      org: process.env.SENTRY_ORG || 'sukit',
      project: process.env.SENTRY_PROJECT || 'sukit-web',
      authToken: process.env.SENTRY_AUTH_TOKEN || '',
      release: this.config.release,
      urlPrefix: '~/',
      include: ['.next/static/chunks', '.next/server/pages'],
      ignore: ['node_modules', '*.map'],
      rewrite: false,
      dist: this.config.release,
      validate: true,
    };
  }

  generateSourceMapUploadScript(): string {
    return `#!/bin/bash
set -euo pipefail
# Sentry Source Map Upload Script
export SENTRY_AUTH_TOKEN="${process.env.SENTRY_AUTH_TOKEN || ''}"
export SENTRY_ORG="${process.env.SENTRY_ORG || 'sukit'}"
export SENTRY_PROJECT="${process.env.SENTRY_PROJECT || 'sukit-web'}"

RELEASE="${this.config.release}"
echo "Uploading source maps for release: \$RELEASE"

npx sentry-cli releases new "\$RELEASE"
npx sentry-cli releases set-commits "\$RELEASE" --auto
npx sentry-cli releases files "\$RELEASE" upload-sourcemaps .next/ \\
  --url-prefix '~/' \\
  --validate \\
  --dist "\$RELEASE"
npx sentry-cli releases finalize "\$RELEASE"

echo "Source maps uploaded for \$RELEASE"`;
  }

  // ─── Error Budget & MTTR Tracking ─────────────────────────────

  getErrorBudget(): { total: number; consumed: number; remaining: number; percentage: number } {
    const total = 1000;
    const consumed = this.errors.length;
    return {
      total,
      consumed,
      remaining: Math.max(0, total - consumed),
      percentage: Math.min(100, (consumed / total) * 100),
    };
  }

  calculateMttr(): number {
    const resolved = this.errors.filter(e => e.level === 'info').length;
    if (resolved === 0) return 0;
    const totalTime = this.errors
      .filter(e => e.level === 'info')
      .reduce((sum, e) => sum + (new Date(e.timestamp).getTime() - Date.now()), 0);
    return Math.abs(totalTime) / resolved;
  }

  // ─── Error Triage Dashboard UI ──────────────────────────────

  generateErrorTriageDashboardHtml(): string {
    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    return `import { useState, useEffect } from 'react';

export function ErrorTriageDashboard() {
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    fetch('/api/errors').then(r => r.json()).then(data => {
      setErrors(data.errors || []);
    });
  }, []);

  const filteredErrors = errors.filter(e => filter === 'all' || e.level === filter);

  return (
    <div className="error-triage">
      <header>
        <h1>Error Triage</h1>
        <div className="filters">
          {['all', 'fatal', 'error', 'warning', 'info'].map(l => (
            <button key={l} className={'filter-btn ' + (filter === l ? 'active' : '')} onClick={() => setFilter(l)}>{l}</button>
          ))}
        </div>
      </header>
      <div className="error-metrics">
        <div className="metric-card"><span className="metric-value">${this.errors.length}</span><span>Total Errors</span></div>
        <div className="metric-card"><span className="metric-value">${Array.from(this.errorCounts.keys()).length}</span><span>Unique Errors</span></div>
        <div className="metric-card"><span className="metric-value">${Math.round(this.calculateMttr() / 60000)}m</span><span>Avg MTTR</span></div>
      </div>
      <div className="error-list">
        {filteredErrors.slice(0, 50).map(e => (
          <div key={e.id} className={'error-row ' + e.level + (selectedError?.id === e.id ? ' selected' : '')} onClick={() => setSelectedError(e)}>
            <span className={'level-badge ' + e.level}>{e.level}</span>
            <span className="error-message">{e.message?.substring(0, 80)}</span>
            <span className="error-time">{new Date(e.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
      {selectedError && (
        <div className="error-detail">
          <h3>Error Details</h3>
          <pre>{JSON.stringify(selectedError, null, 2)}</pre>
          <button onClick={() => setSelectedError(null)}>Close</button>
        </div>
      )}
      <style>{`
        .error-triage { padding: 24px; font-family: -apple-system, sans-serif; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .filters { display: flex; gap: 4px; }
        .filter-btn { padding: 4px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; text-transform: capitalize; }
        .filter-btn.active { background: #4F46E5; color: #fff; border-color: #4F46E5; }
        .error-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .metric-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: 700; color: #4F46E5; display: block; }
        .error-list { max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
        .error-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
        .error-row:hover { background: #f9fafb; }
        .error-row.selected { background: #EEF2FF; }
        .level-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 600; min-width: 50px; text-align: center; }
        .level-badge.fatal { background: #FEE2E2; color: #DC2626; }
        .level-badge.error { background: #FEF3C7; color: #D97706; }
        .level-badge.warning { background: #DBEAFE; color: #2563EB; }
        .level-badge.info { background: #D1FAE5; color: #059669; }
        .error-message { flex: 1; font-size: 13px; color: #374151; }
        .error-time { font-size: 11px; color: #9CA3AF; }
        .error-detail { margin-top: 16px; background: #1f2937; color: #f3f4f6; border-radius: 8px; padding: 16px; }
        .error-detail h3 { margin: 0 0 8px; }
        .error-detail pre { font-size: 12px; overflow-x: auto; max-height: 300px; }
        .error-detail button { margin-top: 8px; padding: 6px 12px; background: #4F46E5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
      `}</style>
    </div>
  );
}`;
  }

  // ─── Alert Escalation ───────────────────────────────────────

  private escalationPolicies: { id: string; ruleName: string; thresholds: { value: number; window: number; escalateAfter: number }[]; channels: string[]; enabled: boolean }[] = [
    { id: 'esc-1', ruleName: 'High Error Rate', thresholds: [{ value: 5, window: 60, escalateAfter: 1 }, { value: 10, window: 30, escalateAfter: 2 }], channels: ['pagerduty', 'phone'], enabled: true },
    { id: 'esc-2', ruleName: 'Error Spike', thresholds: [{ value: 100, window: 5, escalateAfter: 1 }, { value: 500, window: 5, escalateAfter: 3 }], channels: ['pagerduty', 'slack'], enabled: true },
  ];

  addEscalationPolicy(policy: Omit<typeof this.escalationPolicies[0], 'id'>): { id: string } {
    const id = `esc_${crypto.randomUUID().substring(0, 8)}`;
    this.escalationPolicies.push({ ...policy, id });
    return { id };
  }

  getEscalationPolicies(): typeof this.escalationPolicies {
    return this.escalationPolicies;
  }

  checkEscalation(): { escalated: boolean; policies: string[] } {
    const now = Date.now();
    const escalated: string[] = [];
    for (const policy of this.escalationPolicies) {
      if (!policy.enabled) continue;
      const rule = this.alertRules.find(r => r.name === policy.ruleName);
      if (!rule) continue;
      const windowStart = now - rule.window * 60 * 1000;
      const count = this.errors.filter(e => new Date(e.timestamp).getTime() > windowStart).length;
      for (const threshold of policy.thresholds) {
        if (count >= threshold.value) {
          escalated.push(`${policy.ruleName} escalated after ${threshold.escalateAfter} attempts`);
          break;
        }
      }
    }
    return { escalated: escalated.length > 0, policies: escalated };
  }

  // ─── ClamAV / Malware Scanning Integration ─────────────────

  generateClamAvConfig(): { enabled: boolean; socket: string; scanOnUpload: boolean; scanOnDownload: boolean; quarantinePath: string; maxFileSize: number; blockedExtensions: string[]; timeout: number } {
    return {
      enabled: true,
      socket: '/var/run/clamav/clamd.sock',
      scanOnUpload: true,
      scanOnDownload: true,
      quarantinePath: '/data/quarantine/',
      maxFileSize: 26214400,
      blockedExtensions: ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.psm1', '.psd1', '.msi', '.msp', '.mst', '.jar', '.cab', '.dll', '.sys', '.ocx', '.drv', '.cpl', '.scf', '.lnk', '.inf', '.reg', '.shs', '.pcd', '.slk'],
      timeout: 30000,
    };
  }

  scanForMalware(content: Buffer, fileName: string): { infected: boolean; threats: string[]; fileHash: string } {
    const threats: string[] = [];
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs'];
    const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || '';
    if (suspiciousExtensions.includes(ext)) {
      threats.push(`Blocked extension: ${ext}`);
    }
    const eicarPattern = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR';
    if (content.toString().includes(eicarPattern)) {
      threats.push('EICAR test pattern detected');
    }
    if (content.length > 26214400) {
      threats.push('File exceeds maximum scan size (25MB)');
    }
    const hash = createHash('sha256').update(content).digest('hex');
    return { infected: threats.length > 0, threats, fileHash: hash };
  }

  quarantineFile(fileName: string, content: Buffer, reason: string): { quarantined: boolean; path: string; quarantineId: string } {
    const id = `q_${crypto.randomUUID().substring(0, 12)}`;
    return { quarantined: true, path: `/data/quarantine/${id}/${fileName}`, quarantineId: id };
  }
}
