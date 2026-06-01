'use client';

import React from 'react';

export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  label?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
