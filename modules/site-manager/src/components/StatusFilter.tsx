'use client';

import { cn } from '../utils/cn';
import type { PageStatus } from '../types';

const STATUSES: Array<{ value: PageStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'trashed', label: 'Trashed' },
];

interface StatusFilterProps {
  value: PageStatus | 'all';
  onChange: (value: PageStatus | 'all') => void;
  className?: string;
}

export function StatusFilter({
  value,
  onChange,
  className,
}: StatusFilterProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === s.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
