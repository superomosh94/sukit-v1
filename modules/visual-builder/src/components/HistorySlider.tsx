'use client';

import { useCallback, useMemo, useRef } from 'react';
import { Undo2, Redo2, History, Trash2 } from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

interface HistorySliderProps {
  className?: string;
}

export function HistorySlider({ className }: HistorySliderProps) {
  const history = useBuilderStore((s) => s.history);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const sliderRef = useRef<HTMLDivElement>(null);

  const total = history.past.length + history.future.length + 1;
  const currentIndex = history.past.length;
  const sliderValue = total > 0 ? (currentIndex / (total - 1)) * 100 : 0;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = parseInt(e.target.value, 10);
      const diff = target - currentIndex;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) redo();
      } else {
        for (let i = 0; i < -diff; i++) undo();
      }
    },
    [currentIndex, undo, redo]
  );

  const historyEntries = useMemo(() => {
    const entries: { label: string; isPast: boolean; isFuture: boolean }[] = [];
    history.past.forEach(() =>
      entries.push({ label: 'Change', isPast: true, isFuture: false })
    );
    entries.push({ label: 'Current', isPast: false, isFuture: false });
    history.future.forEach(() =>
      entries.push({ label: 'Change', isPast: false, isFuture: true })
    );
    return entries;
  }, [history]);

  if (total <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-card px-3 py-2',
        className
      )}
    >
      <button
        onClick={undo}
        disabled={history.past.length === 0}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title="Undo"
      >
        <Undo2 className="size-4" />
      </button>

      <div className="relative flex-1" ref={sliderRef}>
        <input
          type="range"
          min={0}
          max={Math.max(total - 1, 1)}
          value={currentIndex}
          onChange={handleSliderChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{history.past.length} undo</span>
          <span>{history.future.length} redo</span>
        </div>
      </div>

      <button
        onClick={redo}
        disabled={history.future.length === 0}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        title="Redo"
      >
        <Redo2 className="size-4" />
      </button>
    </div>
  );
}
