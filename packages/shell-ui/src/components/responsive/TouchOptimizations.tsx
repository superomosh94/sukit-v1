'use client';

import React, { type ReactNode } from 'react';

export interface TouchOptimizationsProps {
  children: ReactNode;
  enabled?: boolean;
}

export function TouchOptimizations({
  children,
  enabled = true,
}: TouchOptimizationsProps) {
  return (
    <div
      className={enabled ? 'touch-manipulation' : ''}
      style={
        enabled
          ? {
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
