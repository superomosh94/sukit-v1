'use client';

import type { Block } from '../types';

interface TextBlockProps {
  block: Block;
}

const defaultText = 'Add some text here';

export default function TextBlock({ block }: TextBlockProps) {
  const { props, styles, responsive } = block;

  const text = (props.text as string) || defaultText;
  const asHtml = props.html !== false;

  const style: Record<string, string | number> = {
    fontSize: (styles.fontSize as string) || '16px',
    fontWeight: (styles.fontWeight as string) || '400',
    color: (styles.color as string) || 'inherit',
    textAlign: (styles.textAlign as string) || 'left',
    lineHeight: (styles.lineHeight as string) || '1.6',
  };

  if (asHtml) {
    return <div style={style} dangerouslySetInnerHTML={{ __html: text }} />;
  }

  return <div style={style}>{text}</div>;
}
