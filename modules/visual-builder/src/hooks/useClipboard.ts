import { useState, useCallback } from 'react';

export interface ClipboardData {
  type: string;
  data: any;
  timestamp: number;
}

export function useClipboard() {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  const copy = useCallback((type: string, data: any) => {
    const entry: ClipboardData = { type, data, timestamp: Date.now() };
    setClipboard(entry);
    try {
      localStorage.setItem('sukit-clipboard', JSON.stringify(entry));
    } catch {}
  }, []);

  const cut = useCallback(
    (type: string, data: any) => {
      copy(type, data);
    },
    [copy]
  );

  const paste = useCallback(() => {
    if (clipboard) return clipboard.data;
    try {
      const stored = localStorage.getItem('sukit-clipboard');
      if (stored) return JSON.parse(stored).data;
    } catch {}
    return null;
  }, [clipboard]);

  const hasClipboard = !!clipboard;

  return { clipboard, copy, cut, paste, hasClipboard };
}
