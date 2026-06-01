'use client';

import React, { useState, useRef, type ReactNode } from 'react';

export interface CanvasDropZoneProps {
  onDrop: (data: any) => void;
  accept?: string[];
  children: ReactNode;
  className?: string;
}

export function CanvasDropZone({
  onDrop,
  accept,
  children,
  className,
}: CanvasDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const counter = useRef(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    counter.current++;
    if (counter.current === 1) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    counter.current--;
    if (counter.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    counter.current = 0;
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!accept || accept.includes(data.type)) {
        onDrop(data);
      }
    } catch {
      const text = e.dataTransfer.getData('text/plain');
      if (text) onDrop({ type: 'text', value: text });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative ${isDragOver ? 'ring-2 ring-primary ring-dashed' : ''} ${className || ''}`}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/5 z-10 flex items-center justify-center">
          <p className="text-sm font-medium text-primary">Drop here</p>
        </div>
      )}
      {children}
    </div>
  );
}
