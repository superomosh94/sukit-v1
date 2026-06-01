'use client';

import { useState } from 'react';
import type {
  UsageAnalytics,
  PerformanceAnalytics,
  BusinessAnalytics,
} from '../types';

interface AnalyticsDashboardProps {
  usage: UsageAnalytics | null;
  performance: PerformanceAnalytics | null;
  business: BusinessAnalytics | null;
  loading?: boolean;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  moduleName?: string;
}

export function AnalyticsDashboard({
  usage,
  performance,
  business,
  loading,
  onExport,
  moduleName,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'usage' | 'performance' | 'business'
  >('usage');

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {moduleName ? `${moduleName} Analytics` : 'Analytics'}
        </h2>
        <div className="flex gap-2">
          {(['csv', 'json', 'pdf'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onExport?.(f)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Export {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['usage', 'performance', 'business'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
            >
              {tab === 'usage'
                ? 'Usage'
                : tab === 'performance'
                  ? 'Performance'
                  : 'Business'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'usage' && usage && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Installs"
            value={usage.totalInstalls.toLocaleString()}
          />
          <MetricCard
            label="Active Installs"
            value={usage.activeInstalls.toLocaleString()}
            color="green"
          />
          <MetricCard
            label="Last 30 Days"
            value={usage.last30DaysInstalls.toLocaleString()}
          />
          <MetricCard
            label="Uninstalls"
            value={usage.uninstalls.toLocaleString()}
            color="red"
          />
          <MetricCard
            label="7-Day Retention"
            value={`${usage.retentionRate.day7}%`}
          />
          <MetricCard
            label="30-Day Retention"
            value={`${usage.retentionRate.day30}%`}
          />
          <MetricCard
            label="Update Adoption"
            value={`${usage.updateAdoption}%`}
            color="green"
          />
          <MetricCard
            label="Version Count"
            value={`${usage.versionDistribution.length}`}
          />
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Performance Score"
            value={`${performance.performanceScore}/100`}
            color={
              performance.performanceScore >= 80
                ? 'green'
                : performance.performanceScore >= 50
                  ? 'amber'
                  : 'red'
            }
          />
          <MetricCard
            label="Load Time Impact"
            value={`${performance.loadTimeImpact > 0 ? '+' : ''}${performance.loadTimeImpact}ms`}
            color={performance.loadTimeImpact < 100 ? 'green' : 'red'}
          />
          <MetricCard
            label="Memory Usage"
            value={`${(performance.memoryUsage / 1024 / 1024).toFixed(1)} MB`}
          />
          <MetricCard
            label="Error Rate"
            value={`${(performance.errorRate * 100).toFixed(2)}%`}
            color={performance.errorRate < 0.01 ? 'green' : 'red'}
          />
          <MetricCard
            label="CPU Usage"
            value={`${(performance.resourceUsage.cpu * 100).toFixed(0)}%`}
          />
          <MetricCard
            label="Crash Rate"
            value={`${(performance.crashRate * 100).toFixed(3)}%`}
            color={performance.crashRate < 0.001 ? 'green' : 'red'}
          />
          <MetricCard
            label="Slow Queries"
            value={`${performance.slowQueries.length}`}
          />
          <MetricCard
            label="Avg API Latency"
            value={`${performance.apiLatency.length ? Math.round(performance.apiLatency.reduce((a, b) => a + b.avgMs, 0) / performance.apiLatency.length) : 0}ms`}
          />
        </div>
      )}

      {activeTab === 'business' && business && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`$${business.totalRevenue.toLocaleString()}`}
            color="green"
          />
          <MetricCard label="MRR" value={`$${business.mrr.toLocaleString()}`} />
          <MetricCard label="ARR" value={`$${business.arr.toLocaleString()}`} />
          <MetricCard
            label="Avg Order Value"
            value={`$${business.averageOrderValue.toFixed(2)}`}
          />
          <MetricCard
            label="Conversion Rate"
            value={`${(business.conversionRate * 100).toFixed(1)}%`}
          />
          <MetricCard
            label="Refund Rate"
            value={`${(business.refundRate * 100).toFixed(2)}%`}
            color={business.refundRate < 0.05 ? 'green' : 'red'}
          />
          <MetricCard
            label="CLV"
            value={`$${business.customerLifetimeValue.toFixed(2)}`}
          />
          <MetricCard
            label="Churn Rate"
            value={`${(business.churnRate * 100).toFixed(1)}%`}
            color={business.churnRate < 0.05 ? 'green' : 'red'}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const colors: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold mt-1 ${colors[color] || colors.gray}`}>
        {value}
      </p>
    </div>
  );
}
