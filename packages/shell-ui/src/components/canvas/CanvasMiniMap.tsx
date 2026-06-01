'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface CanvasMiniMapProps {
  className?: string;
}

export function CanvasMiniMap({ className }: CanvasMiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions] = useState({ width: 150, height: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    ctx.strokeStyle = 'rgba(100,100,255,0.3)';
    ctx.strokeRect(10, 10, dimensions.width - 20, dimensions.height - 20);
  }, [dimensions]);

  return (
    <div
      className={`absolute bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg overflow-hidden ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      />
    </div>
  );
}
