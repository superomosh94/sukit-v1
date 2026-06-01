'use client';

import React, { type ReactNode } from 'react';

export interface ThemeContrastProps {
  children: ReactNode;
  highContrast?: boolean;
}

export function ThemeContrast({
  children,
  highContrast = false,
}: ThemeContrastProps) {
  return (
    <div
      className={highContrast ? 'high-contrast' : ''}
      data-high-contrast={highContrast}
    >
      {children}
    </div>
  );
}
