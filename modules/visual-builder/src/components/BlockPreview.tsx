'use client';

import { useMemo } from 'react';
import { blockRegistry } from '../block-registry';
import { cn } from '../utils/cn';
import type { Block } from '../types';

interface BlockPreviewProps {
  block: Block;
  className?: string;
}

export function BlockPreview({ block, className }: BlockPreviewProps) {
  const registration = useMemo(
    () => blockRegistry.getBlockType(block.blockType),
    [block.blockType]
  );

  if (!registration) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded border bg-muted p-4 text-xs text-muted-foreground',
          className
        )}
      >
        Unknown block: {block.blockType}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5">
        <span className="text-base">{registration.icon}</span>
        <span className="text-xs font-medium">{registration.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {block.blockType}
        </span>
      </div>
      <div className="p-3">
        <div className="flex min-h-[60px] items-center justify-center rounded bg-muted/20 p-2">
          {registration.Component ? (
            <div className="pointer-events-none scale-[0.8] transform">
              <registration.Component block={block} />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Preview</span>
          )}
        </div>
      </div>
    </div>
  );
}
