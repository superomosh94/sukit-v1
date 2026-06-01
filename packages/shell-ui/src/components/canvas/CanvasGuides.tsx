'use client';

import React, { type ReactNode } from 'react';

export interface CanvasGuidesProps {
  show?: boolean;
  className?: string;
}

export function CanvasGuides({ show = true, className }: CanvasGuidesProps) {
  if (!show) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className || ''}`}>
      <div className="absolute top-1/3 left-0 right-0 h-px bg-blue-500/30 border-t border-dashed border-blue-500/50" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-blue-500/30 border-t border-dashed border-blue-500/50" />
      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-blue-500/30 border-l border-dashed border-blue-500/50" />
      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-blue-500/30 border-l border-dashed border-blue-500/50" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/40 border-t border-dashed border-red-500/50" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/40 border-l border-dashed border-red-500/50" />
    </div>
  );
}
