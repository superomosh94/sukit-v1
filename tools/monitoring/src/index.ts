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

interface AlertRule {
  id: string;
  name: string;
  metricName: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  duration: number;
  enabled: boolean;
  labels?: Record<string, string>;
}

interface Silence {
  id: string;
  rule: string;
  start: Date;
  end: Date;
  reason: string;
}

interface OnCallEntry {
  userId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

interface SLO {
  name: string;
  target: number;
  windowDays: number;
  totalRequests: number;
  successfulRequests: number;
}

interface AnomalyPoint {
  metric: string;
  value: number;
  mean: number;
  stddev: number;
  timestamp: string;
  severity: 'warning' | 'critical';
}

type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'p95' | 'p99';

const DEDUP_WINDOW = 300000;

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
  private rules: AlertRule[] = [];
  private recentAlerts: {
    title: string;
    severity: string;
    source: string;
    timestamp: Date;
    alertId: string;
  }[] = [];
  private silences: Silence[] = [];
  private onCallSchedule: OnCallEntry[] = [];
  private slos: Map<string, SLO> = new Map();
  private longTermStorage: {
    kernel: SukitKernel;
    retentionDays: number;
  } | null = null;
  private ruleConditionStates: Map<string, { lastMet: number | null }> =
    new Map();

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
                return true;
              }
              return false;
            } catch {
              return false;
            }
          },
        };
      case 'pagerduty':
        return {
          type: 'pagerduty',
          name: 'PagerDuty',
          config,
          send: async (alert) => {
            try {
              const body = {
                routing_key: config.apiKey,
                event_action: 'trigger',
                dedup_key: alert.id,
                payload: {
                  summary: alert.title,
                  source: alert.source,
                  severity: alert.severity,
                  timestamp:
                    typeof alert.timestamp === 'string'
                      ? alert.timestamp
                      : alert.timestamp.toISOString(),
                  component: 'sukit-monitoring',
                  group: alert.severity,
                  class: 'alert',
                  custom_details: alert.details || {},
                },
              };
              await fetch('https://events.pagerduty.com/v2/enqueue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });
              return true;
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
    const now = new Date();

    const duplicate = this.recentAlerts.find(
      (r) =>
        r.title === alert.title &&
        r.severity === alert.severity &&
        r.source === alert.source &&
        now.getTime() - r.timestamp.getTime() < DEDUP_WINDOW
    );

    if (duplicate) {
      const existing = this.alerts.find((a) => a.id === duplicate.alertId);
      if (existing) {
        existing.timestamp = now;
      }
      duplicate.timestamp = now;
      return;
    }

    const onCall = this.getCurrentOnCall();
    const fullAlert: Alert = {
      id: crypto.randomUUID(),
      timestamp: now,
      acknowledged: false,
      ...alert,
      details: {
        ...alert.details,
        ...(alert.severity === 'critical' && onCall.length > 0
          ? { routedTo: onCall.map((u) => u.userId).join(',') }
          : {}),
      },
    };
    this.alerts.push(fullAlert);
    if (this.alerts.length > 1000) this.alerts = this.alerts.slice(-500);

    this.recentAlerts.push({
      title: alert.title,
      severity: alert.severity,
      source: alert.source,
      timestamp: now,
      alertId: fullAlert.id,
    });
    const cutoff = Date.now() - DEDUP_WINDOW;
    this.recentAlerts = this.recentAlerts.filter(
      (r) => r.timestamp.getTime() > cutoff
    );

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
    this.persistMetricPoint(point);
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
    setInterval(
      async () => await this.evaluateRules(),
      this.config.checkInterval
    );
    setInterval(async () => await this.cleanupStaleSilences(), 60000);
  }

  private async runHealthChecks(): Promise<void> {}

  private async cleanupOldMetrics(): Promise<void> {
    const cutoff = Date.now() - 3600000;
    this.metrics = this.metrics.filter(
      (m) => new Date(m.timestamp).getTime() > cutoff
    );
  }

  private async cleanupStaleSilences(): Promise<void> {
    const now = new Date();
    this.silences = this.silences.filter((s) => s.end > now);
  }

  serveMetrics(path: string): (req: any, res: any) => void {
    return async (req: any, res: any) => {
      if (req.url !== path || req.method !== 'GET') {
        if (typeof res.writeHead === 'function') {
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }
      const output = await this.generatePrometheusMetrics();
      if (typeof res.writeHead === 'function') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(output);
      }
    };
  }

  addRule(rule: Omit<AlertRule, 'id' | 'enabled'>): AlertRule {
    const fullRule: AlertRule = {
      id: crypto.randomUUID(),
      enabled: true,
      ...rule,
    };
    this.rules.push(fullRule);
    return fullRule;
  }

  removeRule(ruleId: string): boolean {
    const idx = this.rules.findIndex((r) => r.id === ruleId);
    if (idx === -1) return false;
    this.rules.splice(idx, 1);
    this.ruleConditionStates.delete(ruleId);
    return true;
  }

  async evaluateRules(): Promise<void> {
    const now = Date.now();

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const isSilenced = this.silences.some((s) => {
        const nowTime = new Date();
        return (
          nowTime >= s.start &&
          nowTime <= s.end &&
          (s.rule === rule.id || s.rule === rule.metricName)
        );
      });
      if (isSilenced) continue;

      const metricValue = this.getMetricValue(rule.metricName, rule.labels);
      if (metricValue === null) continue;

      const conditionMet = this.evaluateCondition(
        metricValue,
        rule.operator,
        rule.threshold
      );

      let state = this.ruleConditionStates.get(rule.id);
      if (!state) {
        state = { lastMet: null };
        this.ruleConditionStates.set(rule.id, state);
      }

      if (conditionMet) {
        if (state.lastMet === null) {
          state.lastMet = now;
        } else if (now - state.lastMet >= rule.duration) {
          await this.sendAlert({
            severity: rule.severity,
            title: `Rule: ${rule.name}`,
            message: `${rule.metricName} ${rule.operator} ${rule.threshold} (current: ${metricValue})`,
            source: 'rule-evaluator',
            details: {
              ruleId: rule.id,
              metricName: rule.metricName,
              threshold: rule.threshold,
              actualValue: metricValue,
              operator: rule.operator,
            },
          });
          state.lastMet = null;
        }
      } else {
        state.lastMet = null;
      }
    }
  }

  private getMetricValue(
    metricName: string,
    labels?: Record<string, string>
  ): number | null {
    const key = labels ? `${metricName}:${JSON.stringify(labels)}` : metricName;

    if (this.counters.has(key)) return this.counters.get(key)!;
    if (this.gauges.has(key)) return this.gauges.get(key)!;
    if (this.histograms.has(key)) {
      const vals = this.histograms.get(key)!;
      return vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : null;
    }
    return null;
  }

  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  addSilence(rule: string, start: Date, end: Date, reason: string): Silence {
    const silence: Silence = {
      id: crypto.randomUUID(),
      rule,
      start,
      end,
      reason,
    };
    this.silences.push(silence);
    return silence;
  }

  removeSilence(silenceId: string): boolean {
    const idx = this.silences.findIndex((s) => s.id === silenceId);
    if (idx === -1) return false;
    this.silences.splice(idx, 1);
    return true;
  }

  setOnCallSchedule(schedule: OnCallEntry[]): void {
    this.onCallSchedule = schedule;
  }

  getCurrentOnCall(): OnCallEntry[] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    return this.onCallSchedule.filter((entry) => {
      if (entry.dayOfWeek !== dayOfWeek) return false;
      if (entry.startHour <= entry.endHour) {
        return hour >= entry.startHour && hour < entry.endHour;
      }
      return hour >= entry.startHour || hour < entry.endHour;
    });
  }

  generateGrafanaDashboard(title: string): Record<string, any> {
    return {
      dashboard: {
        __inputs: [],
        __requires: [],
        annotations: { list: [] },
        editable: true,
        fiscalYearStartMonth: 0,
        graphTooltip: 0,
        id: null,
        links: [],
        liveNow: false,
        panels: [
          {
            collapsed: false,
            gridPos: { h: 8, w: 12, x: 0, y: 0 },
            id: 1,
            options: {
              legend: {
                calcs: [],
                displayMode: 'list',
                placement: 'bottom',
                showLegend: true,
              },
              tooltip: { mode: 'multi', sort: 'none' },
            },
            pluginVersion: '9.5.0',
            targets: [
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'rate(http_requests_total[5m])',
                legendFormat: '{{ method }} {{ route }}',
                refId: 'A',
              },
            ],
            title: 'API Requests',
            type: 'timeseries',
          },
          {
            collapsed: false,
            gridPos: { h: 8, w: 12, x: 12, y: 0 },
            id: 2,
            options: {
              calculate: false,
              cellGap: 1,
              cellRadius: 0.5,
              cellValues: {},
              color: {
                exponent: 0.5,
                fill: 'auto',
                mode: 'opacity',
                scheme: 'Oranges',
                steps: 128,
              },
              legend: { show: false },
              rowsFrame: { layout: 'auto' },
              tooltip: { mode: 'single' },
              yAxis: { axisWidth: 80, unit: 'short' },
            },
            pluginVersion: '9.5.0',
            targets: [
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'rate(http_request_duration_seconds_bucket[5m])',
                format: 'heatmap',
                legendFormat: '{{ le }}',
                refId: 'A',
              },
            ],
            title: 'Latency Heatmap',
            type: 'heatmap',
          },
          {
            collapsed: false,
            gridPos: { h: 6, w: 4, x: 0, y: 8 },
            id: 3,
            options: {
              orientation: 'horizontal',
              reduceOptions: {
                calcs: ['lastNotNull'],
                fields: '',
                values: false,
              },
              showThresholdLabels: false,
              showThresholdMarkers: true,
            },
            pluginVersion: '9.5.0',
            targets: [
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'active_users',
                legendFormat: 'Active Users',
                refId: 'A',
              },
            ],
            title: 'Active Users',
            type: 'gauge',
          },
          {
            collapsed: false,
            gridPos: { h: 6, w: 4, x: 4, y: 8 },
            id: 4,
            options: {
              colorMode: 'background',
              graphMode: 'area',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: ['lastNotNull'],
                fields: '',
                values: false,
              },
              textMode: 'auto',
            },
            pluginVersion: '9.5.0',
            targets: [
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'rate(error_count_total[5m]) / rate(http_requests_total[5m]) * 100',
                legendFormat: 'Error Rate',
                refId: 'A',
              },
            ],
            title: 'Error Rate',
            type: 'stat',
          },
          {
            collapsed: false,
            gridPos: { h: 6, w: 4, x: 8, y: 8 },
            id: 5,
            options: {
              footer: {
                enablePagination: true,
                fields: '',
                reducer: ['sum'],
                show: false,
              },
              frameIndex: 0,
              showHeader: true,
              sortBy: [{ displayName: 'CPU' }],
            },
            pluginVersion: '9.5.0',
            targets: [
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'node_cpu_seconds_total',
                format: 'table',
                legendFormat: 'CPU',
                refId: 'A',
              },
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'node_memory_MemTotal_bytes',
                format: 'table',
                legendFormat: 'Memory',
                refId: 'B',
              },
              {
                datasource: { type: 'prometheus', uid: 'PROMETHEUS' },
                expr: 'node_filesystem_size_bytes',
                format: 'table',
                legendFormat: 'Disk',
                refId: 'C',
              },
            ],
            title: 'Resource Usage',
            type: 'table',
          },
        ],
        refresh: '30s',
        schemaVersion: 38,
        style: 'dark',
        tags: ['sukit', 'monitoring'],
        templating: { list: [] },
        time: { from: 'now-6h', to: 'now' },
        timepicker: {},
        timezone: 'browser',
        title,
        uid: `sukit-${title.toLowerCase().replace(/\s+/g, '-')}`,
        version: 1,
        weekStart: '',
      },
      meta: {
        canAdmin: true,
        canDelete: true,
        canEdit: true,
        canSave: true,
        canStar: true,
        created: new Date().toISOString(),
        folderUrl: '',
        hasAcl: false,
        isFolder: false,
        provisioning: false,
        type: 'db',
        updated: new Date().toISOString(),
        url: '/dashboards',
        version: 1,
      },
    };
  }

  trackSLO(name: string, target: number, windowDays: number): void {
    this.slos.set(name, {
      name,
      target,
      windowDays,
      totalRequests: 0,
      successfulRequests: 0,
    });
  }

  calculateSLO(name: string): {
    target: number;
    actual: number;
    met: boolean;
    periodStart: string;
    periodEnd: string;
  } | null {
    const slo = this.slos.get(name);
    if (!slo) return null;

    const now = Date.now();
    const periodStart = new Date(now - slo.windowDays * 86400000);
    const periodEnd = new Date(now);

    const total = slo.totalRequests || 1;
    const actual = slo.successfulRequests / total;

    return {
      target: slo.target,
      actual: Math.round(actual * 10000) / 10000,
      met: actual >= slo.target,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  recordSLORequest(name: string, success: boolean): void {
    const slo = this.slos.get(name);
    if (!slo) return;
    slo.totalRequests++;
    if (success) slo.successfulRequests++;
  }

  detectAnomalies(metricName: string, window: number): AnomalyPoint[] {
    const cutoff = Date.now() - window;
    const points = this.metrics.filter(
      (m) => m.name === metricName && new Date(m.timestamp).getTime() > cutoff
    );

    if (points.length < 3) return [];

    const values = points.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    if (stddev === 0) return [];

    const anomalies: AnomalyPoint[] = [];
    for (const point of points) {
      const deviation = Math.abs(point.value - mean) / stddev;
      if (deviation > 2) {
        anomalies.push({
          metric: metricName,
          value: point.value,
          mean: Math.round(mean * 1000) / 1000,
          stddev: Math.round(stddev * 1000) / 1000,
          timestamp: point.timestamp,
          severity: deviation > 3 ? 'critical' : 'warning',
        });
      }
    }
    return anomalies;
  }

  aggregateMetrics(
    name: string,
    interval: number,
    aggregation: AggregationType
  ): { timestamp: string; value: number }[] {
    const points = this.metrics.filter((m) => m.name === name);
    if (points.length === 0) return [];

    const sorted = [...points].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const buckets: { start: number; values: number[] }[] = [];
    const startTime = new Date(sorted[0].timestamp).getTime();
    const endTime = new Date(sorted[sorted.length - 1].timestamp).getTime();

    for (let t = startTime; t <= endTime; t += interval) {
      buckets.push({ start: t, values: [] });
    }

    for (const point of sorted) {
      const pointTime = new Date(point.timestamp).getTime();
      const bucketIdx = Math.floor((pointTime - startTime) / interval);
      if (bucketIdx >= 0 && bucketIdx < buckets.length) {
        buckets[bucketIdx].values.push(point.value);
      }
    }

    return buckets
      .filter((b) => b.values.length > 0)
      .map((bucket) => ({
        timestamp: new Date(bucket.start).toISOString(),
        value: this.applyAggregation(bucket.values, aggregation),
      }));
  }

  private applyAggregation(
    values: number[],
    aggregation: AggregationType
  ): number {
    const sorted = [...values].sort((a, b) => a - b);
    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return sorted[0];
      case 'max':
        return sorted[sorted.length - 1];
      case 'p95': {
        const idx = Math.floor(sorted.length * 0.95);
        return sorted[idx];
      }
      case 'p99': {
        const idx = Math.floor(sorted.length * 0.99);
        return sorted[idx];
      }
      default:
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
  }

  async enableLongTermStorage(
    kernel: SukitKernel,
    retentionDays: number
  ): Promise<void> {
    this.longTermStorage = { kernel, retentionDays };
    for (const point of this.metrics) {
      await this.persistMetricPoint(point);
    }
  }

  private async persistMetricPoint(point: MetricPoint): Promise<void> {
    if (!this.longTermStorage) return;
    const date = new Date(point.timestamp).toISOString().split('T')[0];
    const key = `monitoring:metrics:${point.name}:${date}`;
    try {
      const existing = await this.longTermStorage.kernel.storage.get(key);
      const points = existing ? JSON.parse(existing as string) : [];
      points.push(point);
      await this.longTermStorage.kernel.storage.set(
        key,
        JSON.stringify(points)
      );
    } catch {}
  }

  async queryHistorical(
    name: string,
    from: Date,
    to: Date,
    resolution: number
  ): Promise<MetricPoint[]> {
    if (!this.longTermStorage) return [];

    const result: MetricPoint[] = [];
    const fromTime = from.getTime();
    const toTime = to.getTime();

    const matching = this.metrics.filter((m) => {
      const t = new Date(m.timestamp).getTime();
      return m.name === name && t >= fromTime && t <= toTime;
    });

    if (resolution <= 0 || matching.length === 0) return matching;

    const buckets = new Map<number, number[]>();
    for (const point of matching) {
      const t = new Date(point.timestamp).getTime();
      const bucketKey = Math.floor(t / resolution) * resolution;
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
      buckets.get(bucketKey)!.push(point.value);
    }

    for (const [bucketTime, values] of buckets) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      result.push({
        name,
        value: Math.round(avg * 1000) / 1000,
        labels: {},
        timestamp: new Date(bucketTime).toISOString(),
      });
    }

    return result.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}
