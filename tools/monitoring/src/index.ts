import type { SukitKernel } from '@sukit/core';
import type {
  Alert,
  AlertChannel,
  MetricPoint,
  PrometheusMetric,
  HealthCheckResult,
} from '../../types';

interface MonitoringConfig {
  checkInterval: number;
  errorRateThreshold: number;
  diskWarningThreshold: number;
  diskCriticalThreshold: number;
  responseTimeWarning: number;
  channels: { type: string; config: Record<string, any> }[];
}

export class MonitoringSystem {
  private kernel: SukitKernel;
  private metrics: MetricPoint[] = [];
  private alerts: Alert[] = [];
  private channels: AlertChannel[] = [];
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private config: MonitoringConfig = {
    checkInterval: 60000,
    errorRateThreshold: 0.05,
    diskWarningThreshold: 85,
    diskCriticalThreshold: 95,
    responseTimeWarning: 2000,
    channels: [],
  };

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.loadConfig();
    this.setupDefaultChannels();
    this.startBackgroundChecks();
  }

  private async loadConfig(): Promise<void> {
    const saved = await this.kernel.settings.get('monitoring:config');
    if (saved) this.config = { ...this.config, ...JSON.parse(saved as string) };
  }

  private setupDefaultChannels(): void {
    if (process.env.SLACK_WEBHOOK_URL)
      this.addChannel('slack', { webhookUrl: process.env.SLACK_WEBHOOK_URL });
    if (process.env.ALERT_EMAIL)
      this.addChannel('email', { to: process.env.ALERT_EMAIL });
    if (process.env.PAGERDUTY_API_KEY)
      this.addChannel('pagerduty', { apiKey: process.env.PAGERDUTY_API_KEY });
  }

  addChannel(type: string, config: Record<string, any>): void {
    const channel = this.createChannel(type, config);
    if (channel) this.channels.push(channel);
  }

  private createChannel(
    type: string,
    config: Record<string, any>
  ): AlertChannel | null {
    switch (type) {
      case 'slack':
        return {
          type: 'slack',
          name: 'Slack',
          config,
          send: async (alert) => {
            const color =
              alert.severity === 'critical'
                ? 'danger'
                : alert.severity === 'warning'
                  ? 'warning'
                  : 'good';
            try {
              const fields = alert.details
                ? Object.entries(alert.details).map(([k, v]) => ({
                    title: k,
                    value: String(v),
                    short: true,
                  }))
                : [];
              const attachment = {
                color,
                title: alert.title,
                text: alert.message,
                fields,
                footer: 'SUKIT Monitoring',
                ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
              };
              await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachments: [attachment] }),
              });
              return true;
            } catch {
              return false;
            }
          },
        };
      case 'email':
        return {
          type: 'email',
          name: 'Email',
          config,
          send: async (alert) => {
            try {
              if (process.env.SMTP_HOST) {
                // In production, use nodemailer
                return true;
              }
              return false;
            } catch {
              return false;
            }
          },
        };
      default:
        return null;
    }
  }

  async sendAlert(
    alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>
  ): Promise<void> {
    const fullAlert: Alert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      acknowledged: false,
      ...alert,
    };
    this.alerts.push(fullAlert);
    if (this.alerts.length > 1000) this.alerts = this.alerts.slice(-500);

    for (const channel of this.channels) {
      try {
        await channel.send(fullAlert);
      } catch {}
    }
  }

  incrementCounter(name: string, labels: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  setGauge(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.gauges.set(key, value);
  }

  observeHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
    if (this.histograms.get(key)!.length > 1000)
      this.histograms.set(key, this.histograms.get(key)!.slice(-500));
  }

  recordMetric(point: MetricPoint): void {
    this.metrics.push(point);
    if (this.metrics.length > 10000) this.metrics = this.metrics.slice(-5000);
  }

  getAlerts(filters?: {
    severity?: string;
    source?: string;
    acknowledged?: boolean;
  }): Alert[] {
    let result = this.alerts;
    if (filters?.severity)
      result = result.filter((a) => a.severity === filters.severity);
    if (filters?.source)
      result = result.filter((a) => a.source === filters.source);
    if (filters?.acknowledged !== undefined)
      result = result.filter((a) => a.acknowledged === filters.acknowledged);
    return result.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = userId;
    }
  }

  async generatePrometheusMetrics(): Promise<string> {
    const lines: string[] = [];
    for (const [key, value] of this.counters) {
      const [name, labelsStr] = this.parseMetricKey(key);
      lines.push(`# HELP ${name} ${name} counter`);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}${labelsStr} ${value}`);
    }
    for (const [key, value] of this.gauges) {
      const [name, labelsStr] = this.parseMetricKey(key);
      lines.push(`# HELP ${name} ${name} gauge`);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name}${labelsStr} ${value}`);
    }
    for (const [key, values] of this.histograms) {
      const [name, labelsStr] = this.parseMetricKey(key);
      const count = values.length;
      const sum = values.reduce((a, b) => a + b, 0);
      lines.push(`# HELP ${name} ${name} histogram`);
      lines.push(`# TYPE ${name} histogram`);
      lines.push(`${name}_count${labelsStr} ${count}`);
      lines.push(`${name}_sum${labelsStr} ${sum}`);
      if (count > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        for (const p of [50, 75, 90, 95, 99]) {
          const idx = Math.floor((sorted.length * p) / 100);
          lines.push(`${name}_p${p}${labelsStr} ${sorted[idx]}`);
        }
      }
    }
    return lines.join('\n');
  }

  private parseMetricKey(key: string): [string, string] {
    const idx = key.indexOf(':{');
    if (idx === -1) return [key, ''];
    return [key.substring(0, idx), key.substring(idx)];
  }

  private startBackgroundChecks(): void {
    setInterval(
      async () => await this.runHealthChecks(),
      this.config.checkInterval
    );
    setInterval(async () => await this.cleanupOldMetrics(), 300000);
  }

  private async runHealthChecks(): Promise<void> {
    // In production, import and use HealthCheck class
  }

  private async cleanupOldMetrics(): Promise<void> {
    const cutoff = Date.now() - 3600000;
    this.metrics = this.metrics.filter(
      (m) => new Date(m.timestamp).getTime() > cutoff
    );
  }
}
