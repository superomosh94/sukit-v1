'use client'

import type { Block } from '@/lib/builder/types'

export default function ListBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const listType = (props.type as string) || 'bullet'
  const items = (props.items as string[]) || []

  const style: React.CSSProperties = {
    color: (styles.color as string) || '#374151',
    fontSize: (styles.fontSize as number) ?? 16,
    lineHeight: 1.8,
    paddingLeft: 24,
    margin: 0,
  }

  if (items.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: 14 }}>Empty list</p>
  }

  const Tag = listType === 'numbered' ? 'ol' : 'ul'

  return (
    <Tag style={style}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  )
}
