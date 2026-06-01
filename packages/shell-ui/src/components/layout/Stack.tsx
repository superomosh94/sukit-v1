'use client';

import React, { type ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  gap?: number;
  className?: string;
}

export function Stack({ children, gap = 4, className }: StackProps) {
  return (
    <div className={`flex flex-col gap-${gap} ${className || ''}`}>
      {children}
    </div>
  );
}
