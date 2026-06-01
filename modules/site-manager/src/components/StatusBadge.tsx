'use client';

import { cn } from '../utils/cn';
import type { PageStatus } from '../types';

interface StatusBadgeProps {
  status: PageStatus;
  className?: string;
}

const STATUS_STYLES: Record<PageStatus, string> = {
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  published:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  trashed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
