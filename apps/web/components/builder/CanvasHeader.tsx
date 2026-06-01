'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Eye,
  Send,
  Grid3x3,
  Maximize2,
  Minimize2,
  Keyboard,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuilderStore } from '@/lib/builder/store';
import { cn } from '@/lib/utils/cn';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { ZoomControls } from './ZoomControls';

export function CanvasHeader() {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.history.past.length > 0);
  const canRedo = useBuilderStore((s) => s.history.future.length > 0);
  const viewport = useBuilderStore((s) => s.viewport);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const zoom = useBuilderStore((s) => s.zoom);
  const setZoom = useBuilderStore((s) => s.setZoom);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const showGrid = useBuilderStore((s) => s.showGrid);
  const setShowGrid = useBuilderStore((s) => s.setShowGrid);
  const fullscreen = useBuilderStore((s) => s.fullscreen);
  const toggleFullscreen = useBuilderStore((s) => s.toggleFullscreen);
  const pageTitle = useBuilderStore((s) => s.pageTitle);
  const lastSaved = useBuilderStore((s) => s.lastSaved);

  const [title, setTitle] = useState(pageTitle);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      useBuilderStore.setState({ pageTitle: value, isDirty: true });
    }, 500);
  }, []);

  const saveStatus = useMemo(() => {
    if (isDirty) return { text: 'Unsaved', color: 'text-amber-500' };
    if (lastSaved) return { text: 'Saved', color: 'text-green-500' };
    return { text: 'Ready', color: 'text-muted-foreground' };
  }, [isDirty, lastSaved]);

  // Global keyboard shortcuts for header actions
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(!useBuilderStore.getState().showGrid);
      }
      if (e.key === '?' || (e.key === '/' && !e.ctrlKey)) {
        setShowShortcuts(true);
      }
      if (e.key === '=' || e.key === '+') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setZoom(useBuilderStore.getState().zoom + 10);
        }
      }
      if (e.key === '-') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setZoom(useBuilderStore.getState().zoom - 10);
        }
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoom(100);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleFullscreen, setShowGrid, setZoom]);

  const deviceButtons = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet (810px)' },
    { id: 'phone' as const, icon: Smartphone, label: 'Phone (390px)' },
  ];

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-6 w-px bg-border" />
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="icon"
            className="size-8"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid (G)"
          >
            <Grid3x3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="h-8 w-48 text-center text-sm font-medium"
            placeholder="Page title..."
          />
          <div className={cn('text-xs font-medium', saveStatus.color)}>
            {saveStatus.text}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-muted p-0.5">
            {deviceButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.id}
                  variant={viewport === btn.id ? 'secondary' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setViewport(btn.id)}
                  title={btn.label}
                >
                  <Icon className="size-3.5" />
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom(zoom - 10)}
              disabled={zoom <= 10}
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-xs tabular-nums">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom(zoom + 10)}
              disabled={zoom >= 500}
              title="Zoom In (Ctrl+=)"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom(100)}
              title="Reset Zoom (Ctrl+0)"
            >
              <Maximize2 className="size-3.5" />
            </Button>
          </div>

          <div className="ml-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen (F)"
            >
              {fullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Eye className="size-3.5" />
              Preview
            </Button>
            <Button size="sm" className="gap-2 h-8">
              <Send className="size-3.5" />
              Publish
            </Button>
          </div>
        </div>
      </header>
      <KeyboardShortcutsPanel
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </>
  );
}
