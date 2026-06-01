'use client';

import React, { type ReactNode } from 'react';

export interface ThemePreviewProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
}

export function ThemePreview({
  children,
  theme = 'light',
  className,
}: ThemePreviewProps) {
  return (
    <div
      className={`${theme} ${className || ''}`}
      style={{ borderRadius: 'inherit' }}
    >
      <div className="bg-background text-foreground border border-border rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}
