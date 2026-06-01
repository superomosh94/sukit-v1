'use client';

import React, { useRef, useState, useEffect, type ReactNode } from 'react';

export interface CanvasPanProps {
  children: ReactNode;
  className?: string;
}

export function CanvasPan({ children, className }: CanvasPanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === ref.current ||
      (e.target as HTMLElement).closest('.canvas-container')
    ) {
      setIsPanning(true);
      lastPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset({
      x: e.clientX - lastPos.current.x,
      y: e.clientY - lastPos.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  useEffect(() => {
    const handleGlobalUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => window.removeEventListener('mouseup', handleGlobalUp);
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} ${className || ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
