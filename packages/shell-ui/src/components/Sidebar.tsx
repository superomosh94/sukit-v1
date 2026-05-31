'use client';

import React, { type ReactNode } from 'react';

export interface SidebarProps {
  children: ReactNode;
  side: 'left' | 'right';
}

export function Sidebar({ children, side }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
