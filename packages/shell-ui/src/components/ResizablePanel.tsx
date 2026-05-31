'use client';

import React, { type ReactNode, useRef, useState, useCallback } from 'react';

export interface ResizablePanelProps {
  children: ReactNode;
  width: number;
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  side: 'left' | 'right';
}

export function ResizablePanel({
  children,
  width,
  onResize,
  minWidth = 200,
  maxWidth = 500,
  side,
}: ResizablePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const delta =
        side === 'left'
          ? e.clientX - startXRef.current
          : startXRef.current - e.clientX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + delta)
      );
      onResize(newWidth);
    },
    [isResizing, minWidth, maxWidth, onResize, side]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative flex-shrink-0" style={{ width }}>
      <div className="h-full">{children}</div>
      <div
        className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
