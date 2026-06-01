'use client';

import React, { type ReactNode } from 'react';
import { useShell } from '../../hooks/useShell';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface ContextToolbarProps {
  context?: string;
  children?: ReactNode;
}

export function ContextToolbar({ context, children }: ContextToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 border-b border-border">
      {context && (
        <span className="text-[10px] uppercase text-muted-foreground font-medium mr-2">
          {context}
        </span>
      )}
      {children}
      <SlotRenderer name={`toolbar:context-${context || 'default'}`} />
    </div>
  );
}
