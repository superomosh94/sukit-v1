import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ExportProgressProps {
  isExporting: boolean;
  progress: number;
  stage: string;
  error?: string;
  onCancel?: () => void;
}

export function ExportProgress({
  isExporting,
  progress,
  stage,
  error,
  onCancel,
}: ExportProgressProps) {
  if (!isExporting && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md">
        {error ? (
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Dismiss
            </button>
          </div>
        ) : isExporting && progress >= 100 ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Complete</h3>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Loader2
              size={48}
              className="mx-auto text-primary animate-spin mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Exporting...</h3>
            <p className="text-sm text-muted-foreground mb-4">{stage}</p>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
