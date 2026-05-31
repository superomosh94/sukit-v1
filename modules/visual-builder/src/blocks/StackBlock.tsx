'use client';

import type { Block } from '../types';
import type { ReactNode } from 'react';

export default function StackBlock({
  block,
  children,
}: {
  block: Block;
  children?: ReactNode;
}) {
  const { props } = block;
  const direction = (props.direction as string) || 'vertical';
  const gap = (props.gap as string) || '12px';
  const alignItems = (props.alignItems as string) || 'stretch';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap,
        alignItems: alignItems as React.CSSProperties['alignItems'],
        width: direction === 'vertical' ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
}
