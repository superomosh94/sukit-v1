'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  FileEdit,
  Trash2,
  Globe,
  UserPlus,
  Download,
  RotateCcw,
  Archive,
  Filter,
  Download as DownloadIcon,
} from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { ActivityAction, EntityType } from '../types';

const ACTION_ICONS: Record<ActivityAction, typeof FileEdit> = {
  create: FileEdit,
  update: FileEdit,
  delete: Trash2,
  publish: Globe,
  restore: RotateCcw,
  archive: Archive,
};

const ACTION_COLORS: Record<ActivityAction, string> = {
  create: 'text-green-500',
  update: 'text-blue-500',
  delete: 'text-red-500',
  publish: 'text-green-600',
  restore: 'text-amber-500',
  archive: 'text-gray-500',
};

export function ActivityLog() {
  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const activity = useSiteManagerStore((s) => s.activity);
  const loadActivity = useSiteManagerStore((s) => s.loadActivity);
  const [filterAction, setFilterAction] = useState<ActivityAction | 'all'>(
    'all'
  );
  const [filterEntity, setFilterEntity] = useState<EntityType | 'all'>('all');

  useEffect(() => {
    if (currentSiteId) loadActivity(currentSiteId, 50);
  }, [currentSiteId, loadActivity]);

  const filtered = activity.filter((entry) => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterEntity !== 'all' && entry.entityType !== filterEntity)
      return false;
    return true;
  });

  const exportLog = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Type', 'Entity ID', 'Entity Name'].join(
        ','
      ),
      ...filtered.map((e) =>
        [
          e.timestamp,
          e.userName ?? e.userId,
          e.action,
          e.entityType,
          e.entityId,
          e.entityName ?? '',
        ]
          .map((v) => `"${v}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-${currentSiteId ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          Activity Log
        </h3>
        <button
          onClick={exportLog}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          title="Export as CSV"
        >
          <DownloadIcon className="size-3.5" />
        </button>
      </div>

      <div className="flex gap-2 border-b px-4 py-2">
        <select
          value={filterAction}
          onChange={(e) =>
            setFilterAction(e.target.value as ActivityAction | 'all')
          }
          className="h-7 rounded border bg-background px-2 text-[10px]"
        >
          <option value="all">All Actions</option>
          {(
            [
              'create',
              'update',
              'delete',
              'publish',
              'restore',
              'archive',
            ] as ActivityAction[]
          ).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={filterEntity}
          onChange={(e) =>
            setFilterEntity(e.target.value as EntityType | 'all')
          }
          className="h-7 rounded border bg-background px-2 text-[10px]"
        >
          <option value="all">All Types</option>
          {(['site', 'page', 'media', 'user', 'team'] as EntityType[]).map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No activity found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((entry) => {
              const Icon = ACTION_ICONS[entry.action] ?? Activity;
              const colorClass =
                ACTION_COLORS[entry.action] ?? 'text-muted-foreground';
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className={cn('mt-0.5', colorClass)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">
                        {entry.userName ?? 'Unknown'}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {entry.action}d
                      </span>{' '}
                      <span className="font-medium">
                        {entry.entityName ?? entry.entityType}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
