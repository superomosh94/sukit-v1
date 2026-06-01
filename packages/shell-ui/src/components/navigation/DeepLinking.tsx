'use client';

import React, { useEffect, type ReactNode } from 'react';
import { useShell } from '../../hooks/useShell';

export interface DeepLinkingProps {
  children: ReactNode;
  onNavigate?: (path: string) => void;
}

export function DeepLinking({ children, onNavigate }: DeepLinkingProps) {
  const { kernel } = useShell();

  useEffect(() => {
    const handler = (e: HashChangeEvent) => {
      const path = window.location.hash.slice(1);
      onNavigate?.(path);
      kernel?.events?.emit?.('navigation:hash-changed', { path });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, [kernel, onNavigate]);

  return <>{children}</>;
}
