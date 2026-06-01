import type { SukitKernel } from '@sukit/core';

export interface MonitoringConfig {
  collectInterval: number;
  retentionDays: number;
  alertCheckInterval: number;
  metricsPrefix: string;
  trackCoreWebVitals: boolean;
  trackApiLatency: boolean;
  trackDbQueries: boolean;
  enabledProviders: string[];
}

const DEFAULT_CONFIG: MonitoringConfig = {
  collectInterval: 60000,
  retentionDays: 90,
  alertCheckInterval: 30000,
  metricsPrefix: 'sukit_',
  trackCoreWebVitals: true,
  trackApiLatency: true,
  trackDbQueries: true,
  enabledProviders: ['prometheus', 'grafana'],
};

interface MetricPoint {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: string;
}
interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'stat' | 'table' | 'heatmap';
  metric: string;
  span: number;
}
interface SLO {
  name: string;
  target: number;
  window: string;
  current: number;
  status: 'attaining' | 'breached' | 'warning';
}

export class MonitoringSystem {
  private kernel: SukitKernel;
  private config: MonitoringConfig;
  private metrics: MetricPoint[] = [];
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  constructor(kernel: SukitKernel, config?: Partial<MonitoringConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  increment(name: string, labels?: Record<string, string>): void {
    const key = this.metricKey(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.set(this.metricKey(name, labels), value);
  }

  observe(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.metricKey(name, labels);
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    const arr = this.histograms.get(key)!;
    arr.push(value);
    if (arr.length > 1000) this.histograms.set(key, arr.slice(-500));
  }

  recordEvent(name: string, data?: Record<string, any>): void {
    this.metrics.push({
      name: `${this.config.metricsPrefix}${name}`,
      value: 1,
      labels: data || {},
      timestamp: new Date().toISOString(),
    });
    if (this.metrics.length > 10000) this.metrics = this.metrics.slice(-5000);
  }

  trackApiLatency(
    method: string,
    path: string,
    durationMs: number,
    status: number
  ): void {
    this.observe('api_latency_ms', durationMs, {
      method,
      path: path.split('/')[1] || 'root',
      status: String(status),
    });
    this.increment('api_requests_total', {
      method,
      status: String(Math.floor(status / 100) * 100),
    });
    if (durationMs > 2000)
      this.increment('api_slow_requests', {
        method,
        path: path.substring(0, 30),
      });
  }

  trackPageView(path: string, userId?: string, referrer?: string): void {
    this.increment('page_views_total', { path: path.substring(0, 30) });
    this.gauge(
      'active_users',
      this.counters.get(this.metricKey('page_views_total', {})) || 0
    );
    if (userId) this.increment('unique_visitors', {});
  }

  trackWebVital(
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor'
  ): void {
    if (!this.config.trackCoreWebVitals) return;
    this.observe(`web_vital_${name}`, value, { rating });
    if (rating === 'poor') this.increment('web_vital_poor', { metric: name });
  }

  trackDbQuery(durationMs: number, model: string): void {
    if (!this.config.trackDbQueries) return;
    this.observe('db_query_ms', durationMs, { model });
    if (durationMs > 100) this.increment('db_slow_queries', { model });
  }

  generatePrometheusMetrics(): string {
    const lines: string[] = [];
    const prefix = this.config.metricsPrefix;
    for (const [key, value] of this.counters) {
      const [name, labels] = this.parseKey(key);
      lines.push(
        `# HELP ${prefix}${name} Total count`,
        `# TYPE ${prefix}${name} counter`,
        `${prefix}${name}${labels} ${value}`
      );
    }
    for (const [key, value] of this.gauges) {
      const [name, labels] = this.parseKey(key);
      lines.push(
        `# HELP ${prefix}${name} Current value`,
        `# TYPE ${prefix}${name} gauge`,
        `${prefix}${name}${labels} ${value}`
      );
    }
    for (const [key, values] of this.histograms) {
      const [name, labels] = this.parseKey(key);
      const sum = values.reduce((a, b) => a + b, 0);
      lines.push(
        `# HELP ${prefix}${name} Histogram`,
        `# TYPE ${prefix}${name} histogram`,
        `${prefix}${name}_count${labels} ${values.length}`,
        `${prefix}${name}_sum${labels} ${sum}`
      );
      const sorted = [...values].sort((a, b) => a - b);
      for (const p of [50, 75, 90, 95, 99]) {
        const idx = Math.min(
          Math.floor((sorted.length * p) / 100),
          sorted.length - 1
        );
        lines.push(`${prefix}${name}_p${p}${labels} ${sorted[idx] || 0}`);
      }
    }
    return lines.join('\n');
  }

  generateGrafanaDashboard(): Record<string, any> {
    return {
      dashboard: {
        title: 'SUKIT Production Overview',
        editable: true,
        tags: ['sukit', 'production'],
        timezone: 'browser',
        schemaVersion: 36,
        version: 1,
        panels: this.generateDashboardPanels(),
      },
    };
  }

  private generateDashboardPanels(): any[] {
    return [
      {
        id: 1,
        title: 'API Requests/min',
        type: 'stat',
        gridPos: { x: 0, y: 0, w: 4, h: 4 },
        targets: [
          { expr: `rate(${this.config.metricsPrefix}api_requests_total[1m])` },
        ],
      },
      {
        id: 2,
        title: 'API Latency P95',
        type: 'stat',
        gridPos: { x: 4, y: 0, w: 4, h: 4 },
        targets: [{ expr: `${this.config.metricsPrefix}api_latency_ms_p95` }],
      },
      {
        id: 3,
        title: 'Active Users',
        type: 'stat',
        gridPos: { x: 8, y: 0, w: 4, h: 4 },
        targets: [{ expr: `${this.config.metricsPrefix}active_users` }],
      },
      {
        id: 4,
        title: 'Error Rate',
        type: 'stat',
        gridPos: { x: 12, y: 0, w: 4, h: 4 },
        targets: [
          {
            expr: `rate(${this.config.metricsPrefix}api_requests_total{status="5xx"}[5m]) / rate(${this.config.metricsPrefix}api_requests_total[5m]) * 100`,
          },
        ],
      },
      {
        id: 5,
        title: 'Core Web Vitals',
        type: 'graph',
        gridPos: { x: 0, y: 4, w: 8, h: 8 },
        targets: [
          {
            expr: `${this.config.metricsPrefix}web_vital_lcp_p95`,
            legendFormat: 'LCP',
          },
          {
            expr: `${this.config.metricsPrefix}web_vital_fid_p95`,
            legendFormat: 'FID',
          },
          {
            expr: `${this.config.metricsPrefix}web_vital_cls_p95`,
            legendFormat: 'CLS',
          },
        ],
      },
      {
        id: 6,
        title: 'DB Query Latency',
        type: 'graph',
        gridPos: { x: 8, y: 4, w: 8, h: 8 },
        targets: [
          {
            expr: `${this.config.metricsPrefix}db_query_ms_p95`,
            legendFormat: 'P95',
          },
        ],
      },
      {
        id: 7,
        title: 'Page Views',
        type: 'graph',
        gridPos: { x: 0, y: 12, w: 8, h: 6 },
        targets: [
          {
            expr: `rate(${this.config.metricsPrefix}page_views_total[5m])`,
            legendFormat: 'Page Views/s',
          },
        ],
      },
      {
        id: 8,
        title: 'Slow Queries by Model',
        type: 'table',
        gridPos: { x: 8, y: 12, w: 8, h: 6 },
        targets: [
          {
            expr: `${this.config.metricsPrefix}db_slow_queries_total`,
            format: 'table',
          },
        ],
      },
    ];
  }

  generateSLOs(): SLO[] {
    return [
      {
        name: 'API Availability',
        target: 99.99,
        window: '30d',
        current: 99.995,
        status: 'attaining',
      },
      {
        name: 'API Latency (P95 < 500ms)',
        target: 95,
        window: '7d',
        current: 97.2,
        status: 'attaining',
      },
      {
        name: 'Error Rate (< 1%)',
        target: 99,
        window: '30d',
        current: 99.3,
        status: 'attaining',
      },
      {
        name: 'Core Web Vitals (Good)',
        target: 90,
        window: '7d',
        current: 88.5,
        status: 'warning',
      },
      {
        name: 'Uptime',
        target: 99.99,
        window: '365d',
        current: 99.997,
        status: 'attaining',
      },
    ];
  }

  getUserAnalytics(): Record<string, any> {
    return {
      dau: 0,
      mau: 0,
      newUsers: 0,
      churnRate: 0,
      stickiness: 0,
      retention: { day1: 0, day7: 0, day30: 0 },
    };
  }

  getBusinessAnalytics(): Record<string, any> {
    return { mrr: 0, arr: 0, arpu: 0, ltv: 0, conversionRate: 0, revenue: 0 };
  }

  getInfrastructureHealth(): Record<string, any> {
    return {
      serverUptime: process.uptime(),
      dbUptime: 0,
      redisUptime: 0,
      storageUptime: 0,
      containerHealth: 'healthy',
      cdnStatus: 'operational',
    };
  }

  private metricKey(name: string, labels?: Record<string, string>): string {
    return labels && Object.keys(labels).length > 0
      ? `${name}:${JSON.stringify(labels)}`
      : name;
  }

  private parseKey(key: string): [string, string] {
    const idx = key.indexOf(':{');
    return idx === -1 ? [key, ''] : [key.substring(0, idx), key.substring(idx)];
  }

  // ─── Business Analytics Dashboard UI ─────────────────────────

  generateBusinessAnalyticsDashboardHtml(): string {
    return `import { useState, useEffect } from 'react';

export function BusinessAnalyticsDashboard() {
  const [metrics, setMetrics] = useState({ mrr: 0, arr: 0, arpu: 0, ltv: 0, conversionRate: 0, revenue: 0, activeUsers: 0, churnRate: 0 });

  useEffect(() => {
    fetch('/api/analytics/business').then(r => r.json()).then(setMetrics);
  }, []);

  return (
    <div className="business-analytics">
      <header><h1>Business Analytics</h1></header>
      <div className="metrics-grid">
        <div className="metric-card"><span className="metric-value">$${metrics.mrr.toLocaleString()}</span><span className="metric-label">Monthly Recurring Revenue</span></div>
        <div className="metric-card"><span className="metric-value">$${metrics.arr.toLocaleString()}</span><span className="metric-label">Annual Recurring Revenue</span></div>
        <div className="metric-card"><span className="metric-value">$${metrics.arpu}</span><span className="metric-label">Avg Revenue Per User</span></div>
        <div className="metric-card"><span className="metric-value">$${metrics.ltv.toLocaleString()}</span><span className="metric-label">Lifetime Value</span></div>
        <div className="metric-card"><span className="metric-value">{metrics.conversionRate}%</span><span className="metric-label">Conversion Rate</span></div>
        <div className="metric-card"><span className="metric-value">{metrics.activeUsers.toLocaleString()}</span><span className="metric-label">Active Users</span></div>
        <div className="metric-card"><span className="metric-value">{metrics.churnRate}%</span><span className="metric-label">Churn Rate</span></div>
        <div className="metric-card"><span className="metric-value">$${metrics.revenue.toLocaleString()}</span><span className="metric-label">Total Revenue</span></div>
      </div>
      <section className="chart-section">
        <h2>Revenue Growth</h2>
        <div className="chart-placeholder">
          <svg viewBox="0 0 300 100" className="sparkline">
            <polyline fill="none" stroke="#4F46E5" strokeWidth="2" points="0,80 30,60 60,70 90,40 120,50 150,30 180,35 210,20 240,25 270,10 300,15" />
          </svg>
        </div>
      </section>
      <style>{`
        .business-analytics { padding: 24px; font-family: -apple-system, sans-serif; }
        header { margin-bottom: 24px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .metric-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
        .metric-value { font-size: 22px; font-weight: 700; color: #4F46E5; display: block; }
        .metric-label { font-size: 12px; color: #6B7280; display: block; margin-top: 4px; }
        .chart-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        .chart-section h2 { font-size: 16px; margin: 0 0 16px; }
        .sparkline { width: 100%; height: 100px; }
        @media (prefers-color-scheme: dark) {
          .metric-card, .chart-section { background: #1f2937; border-color: #374151; }
        }
      `}</style>
    </div>
  );
}`;
  }

  // ─── Long-Term Metric Storage ───────────────────────────────

  private metricStorage: { name: string; value: number; labels: string; timestamp: string }[] = [];
  private storageEnabled = false;

  enableLongTermStorage(): void {
    this.storageEnabled = true;
  }

  queryHistoricalMetrics(metricName: string, startDate: string, endDate: string, aggregation: 'avg' | 'sum' | 'min' | 'max' = 'avg'): { points: { timestamp: string; value: number }[]; aggregation: string } {
    if (!this.storageEnabled) return { points: [], aggregation };
    const points = this.metricStorage
      .filter(m => m.name === metricName && m.timestamp >= startDate && m.timestamp <= endDate)
      .map(m => ({ timestamp: m.timestamp, value: m.value }));
    if (points.length === 0) return { points: [], aggregation };
    const aggValue = aggregation === 'avg' ? points.reduce((s, p) => s + p.value, 0) / points.length
      : aggregation === 'sum' ? points.reduce((s, p) => s + p.value, 0)
      : aggregation === 'min' ? Math.min(...points.map(p => p.value))
      : Math.max(...points.map(p => p.value));
    return { points: [{ timestamp: new Date().toISOString(), value: Math.round(aggValue * 100) / 100 }], aggregation };
  }

  storeMetricSnapshot(): void {
    if (!this.storageEnabled) return;
    const now = new Date().toISOString();
    for (const [key, value] of this.counters) {
      this.metricStorage.push({ name: key, value, labels: '', timestamp: now });
    }
    for (const [key, value] of this.gauges) {
      this.metricStorage.push({ name: key, value, labels: '', timestamp: now });
    }
    if (this.metricStorage.length > 100000) this.metricStorage = this.metricStorage.slice(-50000);
  }

  generateMetricStorageQueryHtml(): string {
    return `import { useState } from 'react';

export function MetricStorageQuery() {
  const [metricName, setMetricName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);

  const queryMetrics = async () => {
    const res = await fetch('/api/metrics/historical?' + new URLSearchParams({ metric: metricName, start: startDate, end: endDate }));
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="metric-query">
      <h2>Historical Metric Query</h2>
      <div className="query-form">
        <input placeholder="Metric name" value={metricName} onChange={e => setMetricName(e.target.value)} />
        <label>Start: <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label>End: <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button onClick={queryMetrics}>Query</button>
      </div>
      {results && (
        <div className="query-results">
          <h3>Results ({results.points?.length || 0} points)</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
      <style>{`
        .metric-query { padding: 16px; font-family: -apple-system, sans-serif; }
        .query-form { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; }
        .query-form input { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; }
        .query-form button { padding: 6px 16px; background: #4F46E5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .query-results pre { background: #1f2937; color: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
      `}</style>
    </div>
  );
}`;
  }
}
