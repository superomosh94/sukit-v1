'use client';

import { useEffect, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { cn } from '../utils/cn';

interface AnalyticsDashboardProps {
  siteId?: string;
  className?: string;
}

const ICON_MAP: Record<string, any> = {
  visitors: Users,
  pageviews: Eye,
  bounceRate: MousePointerClick,
  avgSessionDuration: TrendingUp,
};

export function AnalyticsDashboard({
  siteId,
  className,
}: AnalyticsDashboardProps) {
  const dateRange = useAnalyticsStore((s) => s.dateRange);
  const metrics = useAnalyticsStore((s) => s.metrics);
  const chartData = useAnalyticsStore((s) => s.chartData);
  const setDateRange = useAnalyticsStore((s) => s.setDateRange);
  const setMetrics = useAnalyticsStore((s) => s.setMetrics);
  const setChartData = useAnalyticsStore((s) => s.setChartData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange.from) params.set('from', dateRange.from.toISOString());
        if (dateRange.to) params.set('to', dateRange.to.toISOString());

        const [metricsRes, chartRes] = await Promise.all([
          fetch(`/api/analytics/${siteId}/metrics?${params}`),
          fetch(`/api/analytics/${siteId}/chart?${params}`),
        ]);

        const metricsData = await metricsRes.json();
        const chartData = await chartRes.json();

        setMetrics(metricsData.metrics ?? []);
        setChartData(chartData.data ?? []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    };
    if (siteId) fetchData();
  }, [siteId, dateRange]);

  const presetRanges = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
  ];

  const handlePresetRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateRange(from, to);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          {presetRanges.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetRange(preset.days)}
              className="rounded-md px-3 py-1 text-xs font-medium hover:bg-accent"
            >
              {preset.label}
            </button>
          ))}
          <div className="border-l pl-2 ml-1">
            <input
              type="date"
              value={dateRange.from?.toISOString().split('T')[0] ?? ''}
              onChange={(e) => {
                const from = e.target.value ? new Date(e.target.value) : null;
                setDateRange(from, dateRange.to);
              }}
              className="h-7 w-32 rounded border bg-background px-2 text-xs"
            />
            <span className="mx-1 text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.to?.toISOString().split('T')[0] ?? ''}
              onChange={(e) => {
                const to = e.target.value ? new Date(e.target.value) : null;
                setDateRange(dateRange.from, to);
              }}
              className="h-7 w-32 rounded border bg-background px-2 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = ICON_MAP[metric.icon] ?? TrendingUp;
          return (
            <div key={metric.label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                {metric.value.toLocaleString()}
              </p>
              <p
                className={cn(
                  'text-xs',
                  metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {metric.change >= 0 ? '+' : ''}
                {metric.change}% vs previous period
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">Performance Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              name="Current"
              strokeWidth={2}
            />
            {chartData[0]?.previous !== undefined && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                name="Previous"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
