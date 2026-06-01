'use client';

import React, { useEffect, useCallback, type ReactNode } from 'react';

export interface KeyboardNavItem {
  id: string;
  keys: string[];
  handler: () => void;
  description?: string;
}

export interface KeyboardNavigationProps {
  items: KeyboardNavItem[];
  enabled?: boolean;
  children?: ReactNode;
}

export function KeyboardNavigation({
  items,
  enabled = true,
  children,
}: KeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      for (const item of items) {
        if (item.keys.includes(e.key)) {
          e.preventDefault();
          item.handler();
          return;
        }
      }
    },
    [items, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}
