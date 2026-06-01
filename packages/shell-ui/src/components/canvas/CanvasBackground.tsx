'use client';

import React, { type ReactNode } from 'react';

export interface CanvasBackgroundProps {
  children: ReactNode;
  pattern?: 'checkerboard' | 'dots' | 'grid' | 'none';
  className?: string;
}

const patternStyles: Record<string, string> = {
  checkerboard:
    'bg-[length:20px_20px] bg-[image:linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.03)_25%,rgba(0,0,0,0.03)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.03)_75%)]',
  dots: 'bg-[length:20px_20px] bg-[image:radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)]',
  grid: 'bg-[length:20px_20px] bg-[image:linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)]',
  none: '',
};

export function CanvasBackground({
  children,
  pattern = 'checkerboard',
  className,
}: CanvasBackgroundProps) {
  return (
    <div className={`relative ${patternStyles[pattern]} ${className || ''}`}>
      {children}
    </div>
  );
}
