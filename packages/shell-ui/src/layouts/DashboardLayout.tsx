'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../slots/SlotRenderer';
import { useShellStore } from '../state/shellStore';
import { useShell } from '../hooks/useShell';

export interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme } = useShellStore();
  const { kernel } = useShell();

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">SUKIT Dashboard</h1>
          <div className="flex items-center gap-3">
            <SlotRenderer name="toolbar:top" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SlotRenderer name="dashboard:widgets" />
        </div>
        {children}
      </main>

      <SlotRenderer name="modal:center" />
    </div>
  );
}
