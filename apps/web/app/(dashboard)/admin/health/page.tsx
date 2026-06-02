'use client';

import { useState, useEffect, useCallback } from 'react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

export default function AdminHealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [uptime, setUptime] = useState(0);

  const runChecks = useCallback(async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/admin/health');
      const results: HealthCheck[] = await res.json();
      setChecks(results);
    } catch {
      setChecks([]);
    }
    setUptime(Math.floor((Date.now() - start) / 1000));
    setRunning(false);
  }, []);

  useEffect(() => {
    (async () => {
      const start = Date.now();
      try {
        const res = await fetch('/api/admin/health');
        const results: HealthCheck[] = await res.json();
        setChecks(results);
      } catch {
        setChecks([]);
      }
      setUptime(Math.floor((Date.now() - start) / 1000));
    })();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(runChecks, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, runChecks]);

  const status = checks.every((c) => c.status === 'healthy')
    ? 'healthy'
    : checks.some((c) => c.status === 'unhealthy')
      ? 'unhealthy'
      : 'degraded';
  const statusColors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-amber-500',
    unhealthy: 'bg-red-500',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all system components and dependencies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600"
            />
            Auto-refresh
          </label>
          <button
            onClick={runChecks}
            disabled={running}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {running ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div
        className={`bg-white rounded-xl border p-6 ${status === 'healthy' ? 'border-green-200' : status === 'degraded' ? 'border-amber-200' : 'border-red-200'}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-4 h-4 rounded-full ${statusColors[status]} animate-pulse`}
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {status}
            </h2>
            <p className="text-sm text-gray-500">
              {checks.length} components checked &middot; {uptime}s response
              time
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {checks.map((check) => {
          const colors: Record<string, string> = {
            healthy: 'border-green-200 bg-green-50',
            degraded: 'border-amber-200 bg-amber-50',
            unhealthy: 'border-red-200 bg-red-50',
          };
          const dotColors: Record<string, string> = {
            healthy: 'bg-green-500',
            degraded: 'bg-amber-500',
            unhealthy: 'bg-red-500',
          };
          return (
            <div
              key={check.name}
              className={`bg-white rounded-lg border p-4 transition-all ${colors[check.status]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${dotColors[check.status]}`}
                  />
                  <h3 className="text-sm font-semibold text-gray-900 capitalize">
                    {check.name}
                  </h3>
                </div>
                <span className="text-xs text-gray-400">{check.latency}ms</span>
              </div>
              {check.details && (
                <div className="space-y-1 mt-2 text-xs text-gray-600">
                  {Object.entries(check.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="capitalize">
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              {check.status !== 'healthy' && check.error && (
                <p className="text-xs text-red-600 mt-2">{check.error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
