'use client';

import React, { type ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function Grid({ children, columns = 1, gap = 4, className }: GridProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-${gap} ${className || ''}`}>
      {children}
    </div>
  );
}
