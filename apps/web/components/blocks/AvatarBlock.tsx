'use client'

import type { Block } from '@/lib/builder/types'

export default function AvatarBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const src = props.src as string | undefined
  const alt = (props.alt as string) || 'Avatar'
  const size = (props.size as number) ?? 48
  const borderRadius = (styles.borderRadius as string) || '50%'

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    flexShrink: 0,
  }

  if (!src) {
    const initials = alt
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div style={containerStyle}>
        <span
          style={{
            fontSize: size * 0.4,
            fontWeight: 600,
            color: '#6b7280',
          }}
        >
          {initials || '?'}
        </span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}
