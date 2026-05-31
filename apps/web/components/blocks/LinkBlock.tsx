'use client'

import type { Block } from '@/lib/builder/types'

export default function LinkBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const text = (props.text as string) || 'Click here'
  const url = (props.url as string) || '#'
  const newTab = props.newTab !== false

  const style: React.CSSProperties = {
    color: (styles.color as string) || '#3b82f6',
    fontSize: (styles.fontSize as number) ?? 16,
    fontWeight: (styles.fontWeight as number) ?? 500,
    textDecoration: 'underline',
    cursor: 'pointer',
  }

  return (
    <a
      href={url}
      style={style}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {text}
    </a>
  )
}
