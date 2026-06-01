import { useState, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  label: string;
  snapshot: any;
}

export function useHistory(initial: any, maxEntries = 50) {
  const [entries, setEntries] = useState<HistoryEntry[]>([
    {
      id: 'initial',
      timestamp: new Date(),
      label: 'Initial state',
      snapshot: initial,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const push = useCallback(
    (snapshot: any, label: string) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        label,
        snapshot,
      };
      setEntries((prev) => {
        const truncated = prev.slice(0, currentIndex + 1);
        const next = [...truncated, entry];
        if (next.length > maxEntries) next.shift();
        return next;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, maxEntries - 1));
    },
    [currentIndex, maxEntries]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return entries[currentIndex - 1].snapshot;
    }
    return null;
  }, [currentIndex, entries]);

  const redo = useCallback(() => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return entries[currentIndex + 1].snapshot;
    }
    return null;
  }, [currentIndex, entries]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < entries.length - 1;

  return {
    entries,
    currentIndex,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    current: entries[currentIndex],
  };
}
