import React from 'react';
import { BlockProps, BlockStyles } from '@sukit/shared';

interface ButtonBlockProps {
  props: BlockProps;
  styles: BlockStyles;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none' },
  secondary: { backgroundColor: '#8B5CF6', color: '#FFFFFF', border: 'none' },
  outline: { backgroundColor: 'transparent', color: '#3B82F6', border: '2px solid #3B82F6' },
  ghost: { backgroundColor: 'transparent', color: '#3B82F6', border: 'none' },
  link: { backgroundColor: 'transparent', color: '#3B82F6', border: 'none', padding: '0', textDecoration: 'underline' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 16px', fontSize: '14px' },
  md: { padding: '10px 24px', fontSize: '16px' },
  lg: { padding: '14px 32px', fontSize: '18px' },
};

export function ButtonBlock({ props, styles }: ButtonBlockProps) {
  const { text, url, target, variant, size, fullWidth } = props;

  const combinedStyles: React.CSSProperties = {
    ...styles,
    ...(variantStyles[variant || 'primary'] || {}),
    ...(sizeStyles[size || 'md'] || {}),
    width: fullWidth ? '100%' : undefined,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  };

  return (
    <a href={url || '#'} target={target || '_self'} rel={target === '_blank' ? 'noopener noreferrer' : undefined} style={combinedStyles}>
      {text}
    </a>
  );
}
