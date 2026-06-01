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
}
