'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface MinimalLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function MinimalLayout({ children, className }: MinimalLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      <SlotRenderer name="toolbar:top" />
      <main className="p-4">{children}</main>
      <SlotRenderer name="toolbar:bottom" />
    </div>
  );
}
