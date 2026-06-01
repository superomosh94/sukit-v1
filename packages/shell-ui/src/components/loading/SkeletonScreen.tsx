'use client';

import React from 'react';
import { SkeletonLoader } from '../data-display/SkeletonLoader';

export interface SkeletonScreenProps {
  type?: 'card' | 'table' | 'form' | 'list';
  className?: string;
}

export function SkeletonScreen({
  type = 'card',
  className,
}: SkeletonScreenProps) {
  if (type === 'card') {
    return (
      <div className={`space-y-3 ${className || ''}`}>
        <SkeletonLoader height="160px" className="rounded-lg" />
        <SkeletonLoader width="60%" />
        <SkeletonLoader width="80%" />
        <SkeletonLoader width="40%" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <div className="flex gap-4">
          <SkeletonLoader width="25%" height="12px" />
          <SkeletonLoader width="25%" height="12px" />
          <SkeletonLoader width="25%" height="12px" />
          <SkeletonLoader width="25%" height="12px" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <SkeletonLoader width="25%" height="10px" />
            <SkeletonLoader width="25%" height="10px" />
            <SkeletonLoader width="25%" height="10px" />
            <SkeletonLoader width="25%" height="10px" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <SkeletonLoader width="30%" height="12px" />
        <SkeletonLoader height="36px" className="rounded-md" />
        <SkeletonLoader width="30%" height="12px" />
        <SkeletonLoader height="36px" className="rounded-md" />
        <SkeletonLoader width="30%" height="12px" />
        <SkeletonLoader height="80px" className="rounded-md" />
        <SkeletonLoader width="120px" height="36px" className="rounded-md" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonLoader width="32px" height="32px" className="rounded-full" />
          <SkeletonLoader width="60%" height="12px" />
        </div>
      ))}
    </div>
  );
}
