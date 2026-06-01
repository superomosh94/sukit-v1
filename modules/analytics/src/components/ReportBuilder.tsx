'use client';

import { useState } from 'react';
import { FileText, Download, Plus, X } from 'lucide-react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { cn } from '../utils/cn';

const AVAILABLE_METRICS = [
  { id: 'visitors', label: 'Visitors' },
  { id: 'pageviews', label: 'Page Views' },
  { id: 'bounceRate', label: 'Bounce Rate' },
  { id: 'avgSessionDuration', label: 'Avg. Session Duration' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'conversionRate', label: 'Conversion Rate' },
];

interface ReportBuilderProps {
  siteId?: string;
  className?: string;
}

export function ReportBuilder({ siteId, className }: ReportBuilderProps) {
  const selectedMetrics = useAnalyticsStore((s) => s.selectedMetrics);
  const toggleMetric = useAnalyticsStore((s) => s.toggleMetric);
  const dateRange = useAnalyticsStore((s) => s.dateRange);
  const [reportName, setReportName] = useState('');

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      const params = new URLSearchParams({
        metrics: selectedMetrics.join(','),
        format,
        ...(dateRange.from && { from: dateRange.from.toISOString() }),
        ...(dateRange.to && { to: dateRange.to.toISOString() }),
      });
      const res = await fetch(`/api/analytics/${siteId}/export?${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'analytics-report'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Report Builder</h3>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground">
          Report Name
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Monthly Analytics Report"
          className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
        />
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Select Metrics
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_METRICS.map((metric) => (
            <button
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                selectedMetrics.includes(metric.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
        >
          <Download className="size-3" /> Export CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          <Download className="size-3" /> Export PDF
        </button>
        <button
          onClick={() => handleExport('json')}
          className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          <Download className="size-3" /> Export JSON
        </button>
      </div>
    </div>
  );
}
