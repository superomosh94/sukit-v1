'use client';

import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { blockRegistry } from '../block-registry';
import { cn } from '../utils/cn';
import type { Block } from '../types';

interface BlockVariationsProps {
  blockType: string;
  onSelect?: (templateKey: string) => void;
  className?: string;
}

export function BlockVariations({
  blockType,
  onSelect,
  className,
}: BlockVariationsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const registration = useMemo(
    () => blockRegistry.getBlockType(blockType),
    [blockType]
  );

  const templates = registration?.templates;
  const templateEntries = templates ? Object.entries(templates) : [];

  if (!templateEntries.length) {
    return (
      <div
        className={cn(
          'p-4 text-center text-sm text-muted-foreground',
          className
        )}
      >
        No variations available for this block
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Variations
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {templateEntries.map(([key, template]) => (
          <button
            key={key}
            onClick={() => {
              setSelected(key);
              onSelect?.(key);
            }}
            className={cn(
              'relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-xs transition-colors hover:bg-accent',
              selected === key && 'border-primary ring-1 ring-primary'
            )}
          >
            {selected === key && (
              <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5">
                <Check className="size-2.5 text-primary-foreground" />
              </div>
            )}
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <span className="text-lg">{registration?.icon}</span>
            </div>
            <span className="font-medium capitalize">
              {key.replace(/-/g, ' ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
