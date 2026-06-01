'use client';

import React, { type ReactNode } from 'react';

export interface ToolbarGroupProps {
  label?: string;
  children: ReactNode;
}

export function ToolbarGroup({ label, children }: ToolbarGroupProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {children}
    </div>
  );
}
