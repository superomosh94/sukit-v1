'use client';

import React, { type ReactNode } from 'react';

export interface SidebarBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const badgeVariants: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600',
  warning: 'bg-yellow-500/10 text-yellow-600',
  danger: 'bg-red-500/10 text-red-600',
};

export function SidebarBadge({
  children,
  variant = 'default',
  className,
}: SidebarBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${badgeVariants[variant]} ${className || ''}`}
    >
      {children}
    </span>
  );
}
