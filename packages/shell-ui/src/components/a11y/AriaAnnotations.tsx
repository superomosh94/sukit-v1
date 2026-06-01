'use client';

import React, { type ReactNode } from 'react';

export interface AriaAnnotationsProps {
  children: ReactNode;
  label: string;
  description?: string;
  role?: string;
  live?: 'polite' | 'assertive' | 'off';
}

export function AriaAnnotations({
  children,
  label,
  description,
  role,
  live,
}: AriaAnnotationsProps) {
  return (
    <div
      aria-label={label}
      aria-description={description}
      role={role}
      aria-live={live}
    >
      {children}
    </div>
  );
}
