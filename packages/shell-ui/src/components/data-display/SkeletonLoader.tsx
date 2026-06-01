'use client';

import React from 'react';

export interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  width = '100%',
  height = '16px',
  className,
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-muted rounded ${className || ''}`}
          style={{ width, height, marginBottom: count > 1 ? '8px' : undefined }}
        />
      ))}
    </>
  );
}
