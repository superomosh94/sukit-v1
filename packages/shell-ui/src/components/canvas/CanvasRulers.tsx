'use client';

import React from 'react';

export interface CanvasRulersProps {
  show?: boolean;
  unit?: 'px' | '%';
  className?: string;
}

export function CanvasRulers({
  show = true,
  unit = 'px',
  className,
}: CanvasRulersProps) {
  if (!show) return null;

  const tickMarks = Array.from({ length: 20 }, (_, i) => i * 50);

  return (
    <div className={`pointer-events-none select-none ${className || ''}`}>
      <div className="absolute top-0 left-0 right-0 h-5 bg-card border-b border-border flex items-end">
        {tickMarks.map((tick) => (
          <div
            key={tick}
            className="relative flex-1"
            style={{ maxWidth: `${tick}px` }}
          >
            <div className="h-2 w-px bg-border mx-auto" />
            <span className="absolute left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground top-1">
              {tick}
              {unit}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 bottom-0 w-5 bg-card border-r border-border">
        {tickMarks.map((tick) => (
          <div key={tick} className="relative h-10">
            <div className="w-2 h-px bg-border mx-auto" />
            <span className="absolute top-1/2 -translate-y-1/2 left-1 text-[8px] text-muted-foreground">
              {tick}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
