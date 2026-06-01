'use client';

import React, { type ReactNode } from 'react';

export interface FocusVisibleProps {
  children: ReactNode;
  enabled?: boolean;
}

export function FocusVisible({ children, enabled = true }: FocusVisibleProps) {
  return <div className={enabled ? 'focus-visible-ring' : ''}>{children}</div>;
}
