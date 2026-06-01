'use client';

import React, { type ReactNode } from 'react';

export interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={`border-t border-border p-3 ${className || ''}`}>
      {children}
    </div>
  );
}
