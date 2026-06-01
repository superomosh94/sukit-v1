'use client';

import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export interface SyncStatusProps {
  status: 'synced' | 'syncing' | 'error';
  lastSynced?: Date;
  className?: string;
}

export function SyncStatus({ status, lastSynced, className }: SyncStatusProps) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${className || ''}`}>
      {status === 'syncing' && (
        <RefreshCw size={12} className="animate-spin text-primary" />
      )}
      {status === 'synced' && (
        <CheckCircle2 size={12} className="text-green-500" />
      )}
      {status === 'error' && <AlertCircle size={12} className="text-red-500" />}
      <span className="text-muted-foreground">
        {status === 'syncing' && 'Syncing...'}
        {status === 'synced' && lastSynced
          ? `Synced ${lastSynced.toLocaleTimeString()}`
          : 'Synced'}
        {status === 'error' && 'Sync error'}
      </span>
    </div>
  );
}
