'use client';

import React from 'react';

export interface SidebarSeparatorProps {
  className?: string;
}

export function SidebarSeparator({ className }: SidebarSeparatorProps) {
  return <div className={`h-px bg-border my-2 ${className || ''}`} />;
}
