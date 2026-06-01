'use client';

import React, { type ReactNode } from 'react';

export interface CanvasFrameProps {
  children: ReactNode;
  device?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

const deviceWidths: Record<string, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

export function CanvasFrame({
  children,
  device = 'desktop',
  className,
}: CanvasFrameProps) {
  return (
    <div
      className={`mx-auto border border-border rounded-lg overflow-hidden bg-background shadow-sm ${deviceWidths[device]} ${className || ''}`}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 h-5 rounded bg-muted/50 mx-2" />
      </div>
      <div className="canvas-content">{children}</div>
    </div>
  );
}
