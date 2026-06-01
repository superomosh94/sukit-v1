'use client';

import React, { useEffect, type ReactNode } from 'react';

export interface ModalEscapeProps {
  children: ReactNode;
  onEscape: () => void;
  enabled?: boolean;
}

export function ModalEscape({
  children,
  onEscape,
  enabled = true,
}: ModalEscapeProps) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape, enabled]);

  return <>{children}</>;
}
