'use client';

import { useMemo } from 'react';
import { cn } from '../utils/cn';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  scale?: number;
  length?: number;
  className?: string;
}

export function Ruler({
  orientation,
  scale = 1,
  length = 800,
  className,
}: RulerProps) {
  const marks = useMemo(() => {
    const result: { pos: number; label: string; isMajor: boolean }[] = [];
    const step = orientation === 'horizontal' ? 100 : 50;
    const max = Math.min(length, 2000);
    for (let i = 0; i <= max; i += step) {
      result.push({
        pos: i,
        label: i > 0 ? String(i) : '',
        isMajor: i % (step * 5) === 0,
      });
    }
    return result;
  }, [length, orientation]);

  if (orientation === 'horizontal') {
    return (
      <div
        className={cn(
          'relative h-5 overflow-hidden border-b bg-muted/30 select-none',
          className
        )}
        style={{ width: length }}
      >
        {marks.map((m) => (
          <div
            key={m.pos}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: m.pos * scale }}
          >
            <div
              className={cn(
                'bg-muted-foreground/40',
                m.isMajor ? 'h-3 w-px' : 'h-1.5 w-px'
              )}
            />
            {m.label && (
              <span className="text-[8px] leading-none text-muted-foreground/60">
                {m.label}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-5 overflow-hidden border-r bg-muted/30 select-none',
        className
      )}
      style={{ height: length }}
    >
      {marks.map((m) => (
        <div
          key={m.pos}
          className="absolute left-0 flex items-center"
          style={{ top: m.pos * scale }}
        >
          <div
            className={cn(
              'bg-muted-foreground/40',
              m.isMajor ? 'h-px w-3' : 'h-px w-1.5'
            )}
          />
          {m.label && (
            <span className="ml-0.5 text-[8px] leading-none text-muted-foreground/60">
              {m.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
