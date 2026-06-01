'use client';

import React, { type ReactNode } from 'react';

export interface SidebarPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SidebarPanel({
  title,
  children,
  className,
}: SidebarPanelProps) {
  return (
    <div className={`p-3 ${className || ''}`}>
      {title && (
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}
