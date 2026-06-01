'use client';

import React from 'react';

export interface CanvasPerformanceProps {
  fps?: number;
  blockCount?: number;
  renderTime?: number;
  className?: string;
}

export function CanvasPerformance({
  fps = 60,
  blockCount = 0,
  renderTime = 0,
  className,
}: CanvasPerformanceProps) {
  const fpsColor =
    fps > 50 ? 'text-green-500' : fps > 30 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-3 px-2 py-1 text-[10px] font-mono bg-card/80 border border-border rounded ${className || ''}`}
    >
      <span className={fpsColor}>{fps} FPS</span>
      <span className="text-muted-foreground">{blockCount} blocks</span>
      {renderTime > 0 && (
        <span className="text-muted-foreground">{renderTime}ms</span>
      )}
    </div>
  );
}
