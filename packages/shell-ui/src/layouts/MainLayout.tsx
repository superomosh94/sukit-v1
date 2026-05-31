'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../slots/SlotRenderer';
import { Toolbar } from '../components/Toolbar';
import { StatusBar } from '../components/StatusBar';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { ResizablePanel } from '../components/ResizablePanel';
import { useShellStore } from '../state/shellStore';
import { useShell } from '../hooks/useShell';

export interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const {
    sidebarLeftOpen,
    sidebarRightOpen,
    sidebarWidth,
    currentMode,
    theme,
  } = useShellStore();
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <Toolbar />
        <SlotRenderer name="toolbar:top" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarLeftOpen && (
          <ResizablePanel
            width={sidebarWidth}
            onResize={(width) =>
              useShellStore.getState().setSidebarWidth(width)
            }
            minWidth={200}
            maxWidth={400}
            side="left"
          >
            <Sidebar side="left">
              <SlotRenderer name="sidebar:left" />
            </Sidebar>
          </ResizablePanel>
        )}

        <main className="flex-1 overflow-auto">
          {currentMode === 'split' ? (
            <div className="flex h-full">
              <div className="flex-1 border-r border-border">
                <SlotRenderer name="canvas:main" />
              </div>
              <div className="flex-1">
                <SlotRenderer
                  name="canvas:code"
                  fallback={
                    <div className="p-4 text-muted-foreground">
                      Code editor not available
                    </div>
                  }
                />
              </div>
            </div>
          ) : (
            <Canvas>
              <SlotRenderer name="canvas:main" />
            </Canvas>
          )}
          <SlotRenderer name="canvas:overlay" />
        </main>

        {sidebarRightOpen && (
          <ResizablePanel
            width={320}
            onResize={(width) =>
              useShellStore.getState().setSidebarWidth(width)
            }
            minWidth={250}
            maxWidth={500}
            side="right"
          >
            <Sidebar side="right">
              <SlotRenderer name="sidebar:right" />
            </Sidebar>
          </ResizablePanel>
        )}
      </div>

      <footer className="border-t border-border bg-card">
        <StatusBar />
        <SlotRenderer name="toolbar:bottom" />
      </footer>

      <SlotRenderer name="modal:center" />
      {children}
    </div>
  );
}
