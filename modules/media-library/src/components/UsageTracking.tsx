'use client';

import { useEffect, useState } from 'react';
import { Link, ExternalLink } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import type { UsageRecord } from '../types';
import { cn } from '../utils/cn';

interface UsageTrackingProps {
  assetId: string;
  className?: string;
}

export function UsageTracking({ assetId, className }: UsageTrackingProps) {
  const getUsage = useMediaStore((s) => s.getUsage);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsage(assetId).then((data) => {
      setUsage(data);
      setLoading(false);
    });
  }, [assetId, getUsage]);

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Link className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Where Used</h4>
        <span className="text-xs text-muted-foreground">({usage.length})</span>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : usage.length === 0 ? (
        <p className="text-xs text-muted-foreground">Not used anywhere</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto">
          {usage.map((record, i) => (
            <div
              key={`${record.pageId}-${i}`}
              className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="size-3 text-muted-foreground" />
                <span className="font-medium">
                  Page {record.pageId.slice(0, 8)}
                </span>
              </div>
              <span className="text-muted-foreground">
                {new Date(record.usedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
