'use client';

import { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '@/lib/builder/store';

export function SaveIndicator() {
  const isDirty = useBuilderStore((s) => s.isDirty);
  const lastSaved = useBuilderStore((s) => (s as any).lastSaved) as
    | string
    | null;
  const [saving, setSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string>(() => {
    if (!lastSaved) return '';
    return new Date(lastSaved).toLocaleTimeString();
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isDirty || !lastSaved) return;

    const date = new Date(lastSaved);
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds > 0) {
        setLastSaveTime(`${seconds}s ago`);
      }
    }, 5000);

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

  return (
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
    </div>
  );
}
