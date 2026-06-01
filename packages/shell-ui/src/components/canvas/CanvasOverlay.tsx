'use client';

import React, { type ReactNode } from 'react';

export interface CanvasOverlayProps {
  children?: ReactNode;
  className?: string;
}

export function CanvasOverlay({ children, className }: CanvasOverlayProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className || ''}`}>
      {children}
    </div>
  );
}
