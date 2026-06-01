'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface RetryButtonProps {
  onRetry: () => void;
  label?: string;
  className?: string;
}

export function RetryButton({
  onRetry,
  label = 'Retry',
  className,
}: RetryButtonProps) {
  return (
    <button
      onClick={onRetry}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors ${className || ''}`}
    >
      <RefreshCw size={14} />
      <span>{label}</span>
    </button>
  );
}
