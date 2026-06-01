'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ProgressIndicatorProps {
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function ProgressIndicator({
  progress,
  size = 'md',
  label,
  className,
}: ProgressIndicatorProps) {
  const iconSize = sizeMap[size];

  if (progress !== undefined) {
    return (
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          className="animate-spin"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${progress * 62.8} 62.8`}
            strokeLinecap="round"
            transform="rotate(-90 12 12)"
          />
        </svg>
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Loader2 size={iconSize} className="animate-spin text-primary" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
