'use client';

import React, { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-md bg-muted">
            <Icon size={16} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {(trend || description) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trend && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.positive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
