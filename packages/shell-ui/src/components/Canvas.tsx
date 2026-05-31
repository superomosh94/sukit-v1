'use client';

import React, { type ReactNode, useRef } from 'react';
import { useShellStore } from '../state/shellStore';

export interface CanvasProps {
  children: ReactNode;
}

export function Canvas({ children }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectedBlockId } = useShellStore();

  return (
    <div ref={canvasRef} className="relative h-full bg-muted/20 overflow-auto">
      <div className="canvas-container min-h-full p-8">
        <div className="canvas-content max-w-7xl mx-auto">
          {children || (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg">No builder loaded</p>
                <p className="text-sm">
                  Install a visual builder module to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedBlockId && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="selection-overlay" />
        </div>
      )}
    </div>
  );
}
