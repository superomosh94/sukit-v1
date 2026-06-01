'use client';

import { useCallback } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useCodeEditorStore } from '../stores/codeEditorStore';
import { cn } from '../utils/cn';

interface VisualCodeSyncProps {
  onSyncToVisual?: (code: string) => void;
  onSyncFromVisual?: () => string;
  className?: string;
}

export function VisualCodeSync({
  onSyncToVisual,
  onSyncFromVisual,
  className,
}: VisualCodeSyncProps) {
  const code = useCodeEditorStore((s) => s.code);
  const syncedCode = useCodeEditorStore((s) => s.syncedCode);
  const setSyncedCode = useCodeEditorStore((s) => s.setSyncedCode);

  const isSynced = code === syncedCode;

  const handleSyncToVisual = useCallback(() => {
    if (isSynced) return;
    onSyncToVisual?.(code);
    setSyncedCode(code);
  }, [code, isSynced, onSyncToVisual, setSyncedCode]);

  const handleSyncFromVisual = useCallback(() => {
    const visualCode = onSyncFromVisual?.();
    if (visualCode) {
      useCodeEditorStore.getState().setCode(visualCode);
      setSyncedCode(visualCode);
    }
  }, [onSyncFromVisual, setSyncedCode]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-card px-3 py-2',
        className
      )}
    >
      <ArrowLeftRight
        className={cn('size-4', isSynced ? 'text-green-500' : 'text-amber-500')}
      />
      <span className="flex-1 text-xs text-muted-foreground">
        {isSynced
          ? 'Visual & Code are in sync'
          : 'Changes detected - sync required'}
      </span>
      <button
        onClick={handleSyncToVisual}
        disabled={isSynced}
        className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground disabled:opacity-50"
      >
        <RefreshCw className="size-3" />
        Sync to Visual
      </button>
      <button
        onClick={handleSyncFromVisual}
        className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium hover:bg-accent"
      >
        <RefreshCw className="size-3" />
        Sync from Visual
      </button>
    </div>
  );
}
