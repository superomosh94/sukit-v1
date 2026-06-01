'use client';

import { useState } from 'react';
import { FileText, FileDown, Archive, Check } from 'lucide-react';
import { cn } from '../utils/cn';

const FORMATS = [
  {
    value: 'html',
    label: 'HTML',
    description: 'Static HTML export',
    icon: FileText,
  },
  {
    value: 'pdf',
    label: 'PDF',
    description: 'PDF document export',
    icon: FileDown,
  },
  {
    value: 'zip',
    label: 'ZIP Archive',
    description: 'Full site archive',
    icon: Archive,
  },
] as const;

export type ExportFormat = (typeof FORMATS)[number]['value'];

interface ExportFormatSelectorProps {
  value?: ExportFormat;
  onChange?: (format: ExportFormat) => void;
  className?: string;
}

export function ExportFormatSelector({
  value = 'html',
  onChange,
  className,
}: ExportFormatSelectorProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {FORMATS.map(({ value: val, label, description, icon: Icon }) => (
        <button
          key={val}
          onClick={() => onChange?.(val)}
          className={cn(
            'relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent',
            value === val && 'border-primary ring-1 ring-primary bg-primary/5'
          )}
        >
          {value === val && (
            <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5">
              <Check className="size-3 text-primary-foreground" />
            </div>
          )}
          <Icon className="size-8 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-[10px] text-muted-foreground">
            {description}
          </span>
        </button>
      ))}
    </div>
  );
}

export { FORMATS };
