'use client';

import React, { type ReactNode } from 'react';

export interface BottomSidebarProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function BottomSidebar({
  children,
  height = 200,
  className,
}: BottomSidebarProps) {
  return (
    <div
      className={`border-t border-border bg-card overflow-auto ${className || ''}`}
      style={{ height }}
    >
      {children}
    </div>
  );
}
