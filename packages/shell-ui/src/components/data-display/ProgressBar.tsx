'use client';

import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  variant = 'default',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className || ''}`}>
      <div
        className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`${variantClasses[variant]} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground mt-0.5 block">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
