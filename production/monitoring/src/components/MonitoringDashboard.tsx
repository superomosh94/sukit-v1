import { useState, useEffect } from 'react';

interface MetricCard {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface AlertEvent {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  status: 'firing' | 'resolved';
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    const cards: MetricCard[] = [
      { label: 'API Requests', value: '12,847', trend: 'up', color: '#4F46E5' },
      { label: 'Avg Latency P95', value: '245ms', trend: 'down', color: '#059669' },
      { label: 'Error Rate', value: '0.12%', trend: 'down', color: '#059669' },
      { label: 'Active Users', value: '1,423', trend: 'up', color: '#4F46E5' },
      { label: 'Uptime', value: '99.97%', trend: 'stable', color: '#059669' },
      { label: 'DB Queries', value: '89,234', trend: 'up', color: '#D97706' },
    ];
    setMetrics(cards);
  }, []);

  useEffect(() => {
    const alertData: AlertEvent[] = [
      { id: '1', name: 'High Error Rate', severity: 'critical', message: 'Error rate exceeded 5% threshold', timestamp: new Date().toISOString(), status: 'firing' },
      { id: '2', name: 'Latency Spike', severity: 'warning', message: 'P95 latency > 2s on /api/pages', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'firing' },
      { id: '3', name: 'Disk Usage', severity: 'warning', message: 'Disk usage at 82%', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'firing' },
    ];
    setAlerts(alertData);
  }, []);

  return (
    <div className="monitoring-dashboard">
      <header className="dashboard-header">
        <h1>Monitoring Dashboard</h1>
        <div className="time-range">
          {['1h', '6h', '24h', '7d', '30d'].map(range => (
            <button key={range} className={timeRange === range ? 'active' : ''} onClick={() => setTimeRange(range)}>{range}</button>
          ))}
        </div>
      </header>

      <div className="metrics-grid">
        {metrics.map((metric, i) => (
          <div key={i} className="metric-card" style={{ borderLeftColor: metric.color }}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className={`metric-trend ${metric.trend}`}>
              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
            </div>
          </div>
        ))}
      </div>

      <div className="main-panels">
        <div className="panel chart-panel">
          <h2>API Latency (P95)</h2>
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 200" className="sparkline">
              <polyline fill="none" stroke="#4F46E5" strokeWidth="2"
                points="0,180 40,120 80,150 120,80 160,100 200,60 240,90 280,40 320,70 360,50 400,30" />
            </svg>
          </div>
        </div>

        <div className="panel alerts-panel">
          <h2>Active Alerts</h2>
          <div className="alert-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity} ${alert.status}`}>
                <div className="alert-header">
                  <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                  <span className="alert-name">{alert.name}</span>
                  <span className={`status-badge ${alert.status}`}>{alert.status}</span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{new Date(alert.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panels-row">
        <div className="panel">
          <h2>SLO Status</h2>
          <div className="slo-list">
            {[
              { name: 'API Availability', target: '99.99%', current: '99.97%', status: 'at-risk' },
              { name: 'Latency P95', target: '<500ms', current: '245ms', status: 'healthy' },
              { name: 'Error Rate', target: '<1%', current: '0.12%', status: 'healthy' },
              { name: 'Web Vitals', target: '90%', current: '87%', status: 'at-risk' },
            ].map((slo, i) => (
              <div key={i} className={`slo-item ${slo.status}`}>
                <div className="slo-name">{slo.name}</div>
                <div className="slo-values">
                  <span className="slo-target">Target: {slo.target}</span>
                  <span className="slo-current">Current: {slo.current}</span>
                </div>
                <div className="slo-bar">
                  <div className="slo-fill" style={{ width: `${Math.min(100, parseFloat(slo.current))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Recent Anomalies</h2>
          <div className="anomaly-list">
            <div className="anomaly-item">
              <span className="anomaly-severity critical">2σ</span>
              <span>Traffic spike on /api/pages (+340%)</span>
              <span className="anomaly-time">2m ago</span>
            </div>
            <div className="anomaly-item">
              <span className="anomaly-severity warning">3σ</span>
              <span>Error rate anomaly on auth endpoint</span>
              <span className="anomaly-time">15m ago</span>
            </div>
            <div className="anomaly-item">
              <span className="anomaly-severity info">2σ</span>
              <span>DB query latency increased (+120ms)</span>
              <span className="anomaly-time">1h ago</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .monitoring-dashboard { padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .dashboard-header h1 { margin: 0; font-size: 24px; }
        .time-range button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; cursor: pointer; margin-left: 4px; border-radius: 4px; }
        .time-range button.active { background: #4F46E5; color: #fff; border-color: #4F46E5; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .metric-card { background: #fff; border-radius: 8px; padding: 16px; border-left: 4px solid; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
        .metric-value { font-size: 28px; font-weight: 700; margin: 4px 0; }
        .metric-trend { font-size: 14px; }
        .metric-trend.up { color: #059669; }
        .metric-trend.down { color: #DC2626; }
        .main-panels { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }
        .panel { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .panel h2 { margin: 0 0 16px; font-size: 16px; }
        .chart-placeholder { height: 200px; display: flex; align-items: center; justify-content: center; }
        .sparkline { width: 100%; height: 100%; }
        .alert-item { padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e5e7eb; }
        .alert-item.critical { border-left: 4px solid #DC2626; }
        .alert-item.warning { border-left: 4px solid #D97706; }
        .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .severity-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
        .severity-badge.critical { background: #FEE2E2; color: #DC2626; }
        .severity-badge.warning { background: #FEF3C7; color: #D97706; }
        .severity-badge.info { background: #DBEAFE; color: #2563EB; }
        .status-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        .status-badge.firing { background: #FEE2E2; color: #DC2626; }
        .status-badge.resolved { background: #D1FAE5; color: #059669; }
        .alert-message { font-size: 13px; color: #666; margin: 4px 0; }
        .alert-time { font-size: 11px; color: #999; }
        .panels-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .slo-item { padding: 12px; margin-bottom: 8px; border-radius: 6px; background: #f9fafb; }
        .slo-item.at-risk { border-left: 3px solid #D97706; }
        .slo-item.healthy { border-left: 3px solid #059669; }
        .slo-name { font-weight: 600; margin-bottom: 4px; }
        .slo-values { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 8px; }
        .slo-bar { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
        .slo-fill { height: 100%; background: #4F46E5; border-radius: 3px; }
        .anomaly-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .anomaly-item:last-child { border-bottom: none; }
        .anomaly-severity { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        .anomaly-severity.critical { background: #FEE2E2; color: #DC2626; }
        .anomaly-severity.warning { background: #FEF3C7; color: #D97706; }
        .anomaly-severity.info { background: #DBEAFE; color: #2563EB; }
        .anomaly-time { margin-left: auto; font-size: 11px; color: #999; }
      `}</style>
    </div>
  );
}
