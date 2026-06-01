'use client';

import React, { type ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

export function Container({
  children,
  maxWidth = 'xl',
  className,
}: ContainerProps) {
  return (
    <div
      className={`mx-auto px-4 ${maxWidthClasses[maxWidth] || maxWidthClasses.xl} ${className || ''}`}
    >
      {children}
    </div>
  );
}
