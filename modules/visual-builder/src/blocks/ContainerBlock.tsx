'use client';

import type { Block } from '../types';
import type { ReactNode } from 'react';

interface ContainerBlockProps {
  block: Block;
  children?: ReactNode;
}

export default function ContainerBlock({
  block,
  children,
}: ContainerBlockProps) {
  const { props, styles } = block;

  const style: Record<string, string | number> = {
    maxWidth: (props.maxWidth as string) || '1200px',
    padding: (props.padding as string) || '0 24px',
    backgroundColor: (styles.backgroundColor as string) || 'transparent',
    margin: '0 auto',
    width: '100%',
  };

  return <div style={style}>{children}</div>;
}
