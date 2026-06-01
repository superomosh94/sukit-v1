'use client';

import React from 'react';
import { Clock, type LucideIcon } from 'lucide-react';

export interface Activity {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  icon?: LucideIcon;
}

export interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  className,
}: ActivityFeedProps) {
  const display = activities.slice(0, maxItems);

  return (
    <div className={`space-y-1 ${className || ''}`}>
      {display.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No recent activity
        </p>
      ) : (
        display.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock size={12} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}
                {activity.target && (
                  <span className="text-muted-foreground">
                    {' '}
                    in {activity.target}
                  </span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {activity.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
