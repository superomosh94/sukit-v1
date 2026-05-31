'use client'

import type { Block } from '@/lib/builder/types'

interface ImageBlockProps {
  block: Block
}

export default function ImageBlock({ block }: ImageBlockProps) {
  const { props, styles } = block

  const src = props.src as string | undefined
  const alt = (props.alt as string) || ''
  const caption = props.caption as string | undefined

  const imgStyle: Record<string, string | number> = {
    objectFit: (styles.objectFit as string) || 'cover',
    borderRadius: (styles.borderRadius as string) || '0px',
    maxWidth: (styles.maxWidth as string) || '100%',
    opacity: (styles.opacity as number) ?? 1,
    width: '100%',
    height: 'auto',
    display: 'block',
  }

  if (!src) {
    return (
      <div
        style={{
          ...imgStyle,
          background: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        No image selected
      </div>
    )
  }

  return (
    <figure>
      <img
        src={src}
        alt={alt}
        style={imgStyle}
        loading="lazy"
      />
      {caption && (
        <figcaption
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#6b7280',
            marginTop: 8,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
