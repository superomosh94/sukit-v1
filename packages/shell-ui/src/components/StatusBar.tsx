'use client';

import React from 'react';
import { useShellStore } from '../state/shellStore';
import { useShell } from '../hooks/useShell';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function StatusBar() {
  const { currentSiteId, currentPageId, currentMode } = useShellStore();
  const { kernel } = useShell();
  const [status, setStatus] = React.useState<{
    message: string;
    type: 'info' | 'success' | 'error';
  }>({
    message: 'Ready',
    type: 'info',
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const unsub1 = kernel.events.on('editor:save-start', () => {
      setSaving(true);
      setStatus({ message: 'Saving...', type: 'info' });
    });

    const unsub2 = kernel.events.on('editor:save-complete', () => {
      setSaving(false);
      setStatus({ message: 'Saved', type: 'success' });
      setTimeout(() => setStatus({ message: 'Ready', type: 'info' }), 2000);
    });

    const unsub3 = kernel.events.on('editor:save-error', (error: Error) => {
      setSaving(false);
      setStatus({ message: `Error: ${error.message}`, type: 'error' });
      setTimeout(() => setStatus({ message: 'Ready', type: 'info' }), 3000);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [kernel]);

  return (
    <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        {saving ? (
          <Loader2 size={12} className="animate-spin" />
        ) : status.type === 'success' ? (
          <CheckCircle2 size={12} className="text-green-500" />
        ) : status.type === 'error' ? (
          <AlertCircle size={12} className="text-red-500" />
        ) : null}
        <span>{status.message}</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Site: {currentSiteId ? currentSiteId.slice(0, 8) : 'None'}</span>
        <span>Page: {currentPageId ? currentPageId.slice(0, 8) : 'None'}</span>
        <span>Mode: {currentMode}</span>
        <span className="cursor-pointer hover:text-foreground">Zoom: 100%</span>
      </div>
    </div>
  );
}
