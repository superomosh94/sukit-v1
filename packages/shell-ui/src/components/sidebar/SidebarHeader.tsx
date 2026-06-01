'use client';

import React, { type ReactNode } from 'react';

export interface SidebarHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function SidebarHeader({
  title,
  children,
  className,
}: SidebarHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 border-b border-border ${className || ''}`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}
