'use client';

import React from 'react';
import { Clock, type LucideIcon } from 'lucide-react';

export interface RecentItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  timestamp?: Date;
}

export interface RecentItemsProps {
  items: RecentItem[];
  maxItems?: number;
  className?: string;
}

export function RecentItems({
  items,
  maxItems = 5,
  className,
}: RecentItemsProps) {
  const display = items.slice(0, maxItems);

  return (
    <div className={`space-y-0.5 ${className || ''}`}>
      {display.length === 0 ? (
        <p className="text-sm text-muted-foreground px-3 py-2">
          No recent items
        </p>
      ) : (
        display.map((item) => {
          const Icon = item.icon || Clock;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Icon size={14} className="text-muted-foreground" />
              <span>{item.label}</span>
              {item.timestamp && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {item.timestamp.toLocaleDateString()}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
