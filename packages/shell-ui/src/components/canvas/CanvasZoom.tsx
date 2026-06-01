'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface CanvasZoomProps {
  onZoomChange?: (zoom: number) => void;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function CanvasZoom({
  onZoomChange,
  defaultZoom = 1,
  minZoom = 0.1,
  maxZoom = 5,
}: CanvasZoomProps) {
  const [zoom, setZoom] = useState(defaultZoom);

  const handleZoom = (newZoom: number) => {
    const clamped = Math.min(maxZoom, Math.max(minZoom, newZoom));
    setZoom(clamped);
    onZoomChange?.(clamped);
  };

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1 shadow-sm">
      <button
        onClick={() => handleZoom(zoom - 0.1)}
        className="p-1 rounded hover:bg-accent transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut size={14} />
      </button>
      <span className="text-xs font-mono min-w-[40px] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => handleZoom(zoom + 0.1)}
        className="p-1 rounded hover:bg-accent transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={() => handleZoom(1)}
        className="p-1 rounded hover:bg-accent transition-colors"
        aria-label="Reset zoom"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
