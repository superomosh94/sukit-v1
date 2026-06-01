'use client';

import React, { type ReactNode } from 'react';

export interface DataGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function DataGrid<T>({
  data,
  renderItem,
  columns = 3,
  gap = 4,
  className,
}: DataGridProps<T>) {
  return (
    <div
      className={`grid ${className || ''}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 4}px`,
      }}
    >
      {data.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
