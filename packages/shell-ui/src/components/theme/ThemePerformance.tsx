'use client';

import React, { type ReactNode } from 'react';

export interface ThemePerformanceProps {
  children: ReactNode;
  preferReducedTransitions?: boolean;
  disableAnimations?: boolean;
}

export function ThemePerformance({
  children,
  preferReducedTransitions = false,
  disableAnimations = false,
}: ThemePerformanceProps) {
  return (
    <div
      data-reduced-motion={preferReducedTransitions || disableAnimations}
      className={disableAnimations ? 'disable-animations' : ''}
      style={
        preferReducedTransitions ? { transitionDuration: '0ms' } : undefined
      }
    >
      {children}
    </div>
  );
}
