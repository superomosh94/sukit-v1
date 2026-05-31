'use client';

import type { Block } from '../types';
import React from 'react';

interface ButtonBlockProps {
  block: Block;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: '#3b82f6', color: '#fff', border: 'none' },
  secondary: { background: '#6b7280', color: '#fff', border: 'none' },
  outline: {
    background: 'transparent',
    color: '#3b82f6',
    border: '2px solid #3b82f6',
  },
  ghost: { background: 'transparent', color: '#3b82f6', border: 'none' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 13 },
  md: { padding: '10px 22px', fontSize: 15 },
  lg: { padding: '14px 32px', fontSize: 17 },
};

export default function ButtonBlock({ block }: ButtonBlockProps) {
  const { props, styles, animation } = block;

  const variant = (props.variant as string) || 'primary';
  const size = (props.size as string) || 'md';
  const text = (props.text as string) || 'Button';
  const url = props.url as string | undefined;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: (styles.borderRadius as string) || '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const hoverStyle: React.CSSProperties = {};

  const combinedStyle = { ...baseStyle, ...hoverStyle };

  if (url) {
    return (
      <a
        href={url}
        style={combinedStyle}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    );
  }

  return (
    <button style={combinedStyle} type="button">
      {text}
    </button>
  );
}
