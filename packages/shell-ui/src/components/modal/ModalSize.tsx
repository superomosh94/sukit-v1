'use client';

import React, { type ReactNode } from 'react';

export interface ModalSizeProps {
  children: ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full' | number;
  className?: string;
}

const presetSizes: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export function ModalSize({ children, size, className }: ModalSizeProps) {
  if (typeof size === 'number') {
    return (
      <div className={className} style={{ maxWidth: size }}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={`w-full ${presetSizes[size] || presetSizes.md} ${className || ''}`}
    >
      {children}
    </div>
  );
}
