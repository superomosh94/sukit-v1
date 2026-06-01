'use client';

import React, { type ReactNode } from 'react';

export interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
  wrap?: boolean;
  className?: string;
}

const alignClasses: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Flex({
  children,
  direction = 'row',
  align,
  justify,
  gap = 4,
  wrap = false,
  className,
}: FlexProps) {
  return (
    <div
      className={`flex flex-${direction} ${align ? alignClasses[align] : ''} ${justify ? justifyClasses[justify] : ''} gap-${gap} ${wrap ? 'flex-wrap' : ''} ${className || ''}`}
    >
      {children}
    </div>
  );
}
