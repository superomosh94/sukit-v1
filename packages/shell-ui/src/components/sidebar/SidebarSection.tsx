'use client';

import React, { type ReactNode } from 'react';

export interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SidebarSection({
  title,
  children,
  className,
}: SidebarSectionProps) {
  return (
    <div className={`border-b border-border ${className || ''}`}>
      <div className="px-3 py-2">
        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
          {title}
        </h4>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );
}
