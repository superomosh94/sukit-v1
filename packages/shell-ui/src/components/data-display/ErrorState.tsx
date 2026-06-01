'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ''}`}
    >
      <div className="p-4 rounded-full bg-red-500/10 mb-4">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 mt-4 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={14} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
