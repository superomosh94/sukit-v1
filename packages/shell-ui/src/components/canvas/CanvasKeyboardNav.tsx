'use client';

import React, { useEffect, useCallback, type ReactNode } from 'react';

export interface CanvasKeyboardNavProps {
  children: ReactNode;
  onKeyAction?: (action: string, event: KeyboardEvent) => void;
  className?: string;
}

const keyBindings: Record<string, string> = {
  ArrowUp: 'move-up',
  ArrowDown: 'move-down',
  ArrowLeft: 'move-left',
  ArrowRight: 'move-right',
  Delete: 'delete',
  Backspace: 'delete',
  Escape: 'deselect',
  Enter: 'edit',
  Tab: 'next',
};

export function CanvasKeyboardNav({
  children,
  onKeyAction,
  className,
}: CanvasKeyboardNavProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const action = keyBindings[e.key];
      if (action) {
        e.preventDefault();
        onKeyAction?.(action, e);
      }
    },
    [onKeyAction]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <div className={className}>{children}</div>;
}
