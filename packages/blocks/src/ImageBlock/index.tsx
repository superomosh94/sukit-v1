import React from 'react';
import { BlockProps, BlockStyles } from '@sukit/shared';

interface ImageBlockProps {
  props: BlockProps;
  styles: BlockStyles;
}

export function ImageBlock({ props, styles }: ImageBlockProps) {
  const { src, alt, width, height, objectFit, link, lazy } = props;

  const img = (
    <img
      src={src}
      alt={alt || ''}
      width={width || undefined}
      height={height || undefined}
      loading={lazy ? 'lazy' : 'eager'}
      style={{
        ...styles,
        objectFit: objectFit || 'cover',
        width: width || '100%',
        height: height || 'auto',
      }}
    />
  );

  if (link) {
    return <a href={link}>{img}</a>;
  }

  return img;
}
