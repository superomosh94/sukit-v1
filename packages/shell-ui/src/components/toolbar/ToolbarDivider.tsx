'use client';

import React from 'react';

export interface ToolbarDividerProps {
  orientation?: 'vertical' | 'horizontal';
}

export function ToolbarDivider({
  orientation = 'vertical',
}: ToolbarDividerProps) {
  return (
    <div
      className={`bg-border ${
        orientation === 'vertical' ? 'w-px h-6 mx-1' : 'h-px w-full my-1'
      }`}
    />
  );
}
