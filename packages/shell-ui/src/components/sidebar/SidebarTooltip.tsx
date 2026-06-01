'use client';

import React, { useState, useRef, useEffect, type ReactNode } from 'react';

export interface SidebarTooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function SidebarTooltip({
  label,
  children,
  side = 'right',
}: SidebarTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const sideClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  };

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-2 py-1 text-[10px] bg-popover text-popover-foreground rounded shadow-lg whitespace-nowrap ${sideClasses[side] || sideClasses.right}`}
        >
          {label}
        </div>
      )}
    </div>
  );
}
