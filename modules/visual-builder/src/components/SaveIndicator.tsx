'use client';

import { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

export function SaveIndicator() {
  const isDirty = useBuilderStore((s) => s.isDirty);
  const lastSaved = useBuilderStore((s) => (s as any).lastSaved) as
    | string
    | null;
  const [saving, setSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [showConflict, setShowConflict] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (lastSaved) {
      const date = new Date(lastSaved);
      setLastSaveTime(date.toLocaleTimeString());
    }
  }, [lastSaved]);

  useEffect(() => {
    if (isDirty) {
      timerRef.current = setInterval(() => {
        if (lastSaved) {
          const seconds = Math.floor(
            (Date.now() - new Date(lastSaved).getTime()) / 1000
          );
          if (seconds > 0) {
            setLastSaveTime(`${seconds}s ago`);
          }
        }
      }, 5000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDirty, lastSaved]);

  const simulateSave = () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setTimeout(() => {
      const store = useBuilderStore.getState() as any;
      store.lastSaved = new Date().toISOString();
      store.isDirty = false;
      setSaving(false);
    }, 800);
  };

  const checkConflict = () => {
    const store = useBuilderStore.getState() as any;
    const localHash = store.sceneVersion;
    const remoteHash = store.remoteSceneVersion;
    if (remoteHash && localHash !== remoteHash) {
      setShowConflict(true);
      return true;
    }
    return false;
  };

  const resolveConflict = (choice: 'local' | 'remote') => {
    const store = useBuilderStore.getState() as any;
    if (choice === 'remote') {
      store.loadBlocks(store.remoteSections ?? store.sections);
    }
    store.sceneVersion = crypto.randomUUID().slice(0, 8);
    store.remoteSceneVersion = store.sceneVersion;
    setShowConflict(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 text-xs">
        {saving ? (
          <div className="flex items-center gap-1.5">
            <span className="size-2 animate-pulse rounded-full bg-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-400">
              Saving...
            </span>
          </div>
        ) : isDirty ? (
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500" />
            <span className="text-red-600 dark:text-red-400">Unsaved</span>
            {lastSaveTime && (
              <span className="text-muted-foreground">({lastSaveTime})</span>
            )}
            <button
              onClick={simulateSave}
              className="ml-1 rounded border px-1.5 py-0.5 text-[10px] hover:bg-accent"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-green-600 dark:text-green-400">Saved</span>
            {lastSaveTime && (
              <span className="text-muted-foreground">({lastSaveTime})</span>
            )}
          </div>
        )}
        <button
          onClick={checkConflict}
          className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
          title="Check for conflicts"
        >
          Check
        </button>
      </div>

      {showConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-96 rounded-lg border bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-sm font-medium">Version Conflict</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              This document has been modified externally. Choose which version
              to keep:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => resolveConflict('local')}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
              >
                Keep My Changes
              </button>
              <button
                onClick={() => resolveConflict('remote')}
                className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
              >
                Accept External Changes
              </button>
            </div>
            <button
              onClick={() => setShowConflict(false)}
              className="mt-2 w-full rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
