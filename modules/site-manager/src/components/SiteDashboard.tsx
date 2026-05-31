'use client';

import { useEffect } from 'react';
import {
  FileText,
  Layers,
  Image as ImageIcon,
  Users,
  HardDrive,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

export function SiteDashboard() {
  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const stats = useSiteManagerStore((s) => s.stats);
  const loadStats = useSiteManagerStore((s) => s.loadStats);
  const activity = useSiteManagerStore((s) => s.activity);
  const loadActivity = useSiteManagerStore((s) => s.loadActivity);
  const latestActivity = activity.slice(0, 5);

  useEffect(() => {
    if (currentSiteId) {
      loadStats(currentSiteId);
      loadActivity(currentSiteId, 10);
    }
  }, [currentSiteId, loadStats, loadActivity]);

  if (!currentSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select a site to view dashboard
        </p>
      </div>
    );
  }

  const widgets = [
    {
      label: 'Pages',
      value: stats?.totalPages ?? 0,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Blocks',
      value: stats?.totalBlocks ?? 0,
      icon: Layers,
      color: 'text-violet-500',
    },
    {
      label: 'Media',
      value: stats?.totalMedia ?? 0,
      icon: ImageIcon,
      color: 'text-green-500',
    },
    {
      label: 'Team',
      value: stats?.totalTeamMembers ?? 0,
      icon: Users,
      color: 'text-orange-500',
    },
  ];

  const storagePercent = stats
    ? Math.round((stats.storageUsed / stats.storageLimit) * 100)
    : 0;

  const scores = [
    {
      label: 'Performance',
      value: stats?.performanceScore,
      color: 'text-green-500',
    },
    { label: 'SEO', value: stats?.seoScore, color: 'text-amber-500' },
    {
      label: 'Accessibility',
      value: stats?.accessibilityScore,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {widgets.map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <Icon className={cn('size-5', w.color)} />
                <span className="text-2xl font-bold">{w.value}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{w.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
            <HardDrive className="size-4 text-muted-foreground" />
            Storage
          </h3>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                storagePercent > 80
                  ? 'bg-red-500'
                  : storagePercent > 50
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              )}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {storagePercent}% used (
            {Math.round((stats?.storageUsed ?? 0) / 1024 / 1024)}MB /{' '}
            {Math.round((stats?.storageLimit ?? 0) / 1024 / 1024)}MB)
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            Scores
          </h3>
          <div className="space-y-2">
            {scores.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className={cn('text-xs font-medium', s.color)}>
                  {s.value != null ? `${s.value}/100` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          Recent Activity
        </h3>
        {latestActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No recent activity
          </p>
        ) : (
          <div className="space-y-2">
            {latestActivity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 text-xs">
                <CheckCircle className="size-3 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  {entry.userName ?? 'Unknown'}
                </span>
                <span>{entry.action}</span>
                <span className="text-muted-foreground">
                  {entry.entityName ?? entry.entityType}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
