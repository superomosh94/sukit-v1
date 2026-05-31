import React from 'react';
import { BlockProps, BlockStyles, BlockAnimation } from '@sukit/shared';

interface TextBlockProps {
  props: BlockProps;
  styles: BlockStyles;
  animation?: BlockAnimation;
}

export function TextBlock({ props, styles }: TextBlockProps) {
  const { content, tag, link } = props;
  const Tag = (tag || 'p') as keyof JSX.IntrinsicElements;

  const inner = (
    <Tag
      style={styles}
      dangerouslySetInnerHTML={typeof content === 'string' ? { __html: content } : undefined}
    >
      {typeof content !== 'string' ? content : undefined}
    </Tag>
  );

  if (link) {
    return <a href={link} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
  }

  return inner;
}
