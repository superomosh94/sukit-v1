'use client';

import React, { type ReactNode } from 'react';

export interface ResponsiveSidebarsProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  bottomContent?: ReactNode;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

export function ResponsiveSidebars({
  leftContent,
  rightContent,
  bottomContent,
  breakpoint,
}: ResponsiveSidebarsProps) {
  if (breakpoint === 'mobile') {
    return <>{bottomContent}</>;
  }

  if (breakpoint === 'tablet') {
    return (
      <div className="flex h-full">
        <div className="w-48 border-r border-border">{leftContent}</div>
        <div className="flex-1" />
        <div className="w-48 border-l border-border">{rightContent}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-60 border-r border-border">{leftContent}</div>
      <div className="flex-1" />
      <div className="w-72 border-l border-border">{rightContent}</div>
    </div>
  );
}
