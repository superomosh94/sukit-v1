'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface TabletLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function TabletLayout({ children, className }: TabletLayoutProps) {
  return (
    <div
      className={`flex flex-col h-screen bg-background text-foreground ${className || ''}`}
    >
      <header className="border-b border-border bg-card">
        <SlotRenderer name="toolbar:top" />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r border-border bg-card overflow-auto">
          <SlotRenderer name="sidebar:left" />
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
        <aside className="w-48 border-l border-border bg-card overflow-auto">
          <SlotRenderer name="sidebar:right" />
        </aside>
      </div>
    </div>
  );
}
