'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface MobileLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div
      className={`flex flex-col h-screen bg-background text-foreground ${className || ''}`}
    >
      <header className="border-b border-border bg-card">
        <SlotRenderer name="toolbar:top" />
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
      <footer className="border-t border-border bg-card">
        <SlotRenderer name="sidebar:bottom" />
      </footer>
    </div>
  );
}
