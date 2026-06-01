'use client';

import { useEffect, useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { cn } from '../utils/cn';

interface UserActivityLogProps {
  siteId?: string;
  className?: string;
}

export function UserActivityLog({ siteId, className }: UserActivityLogProps) {
  const userActivity = useAnalyticsStore((s) => s.userActivity);
  const setUserActivity = useAnalyticsStore((s) => s.setUserActivity);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    const fetchActivity = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filterAction !== 'all') params.set('action', filterAction);
        const res = await fetch(`/api/analytics/${siteId}/activity?${params}`);
        const data = await res.json();
        setUserActivity(data.activity ?? []);
      } catch {}
      setLoading(false);
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [siteId, search, filterAction]);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">User Activity</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {userActivity.length} events
        </span>
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="publish">Publish</option>
        </select>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : userActivity.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No activity found
          </div>
        ) : (
          <div className="divide-y">
            {userActivity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 px-4 py-3 text-sm"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {entry.userName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{entry.userName}</span>{' '}
                    <span className="text-muted-foreground">
                      {entry.action}
                    </span>{' '}
                    <span className="font-medium">
                      {entry.entityName ?? entry.entityType}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
