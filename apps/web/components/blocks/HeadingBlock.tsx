'use client'

import type { Block } from '@/lib/builder/types'
import { createElement } from 'react'

const headingStyles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 48, fontWeight: 800, lineHeight: 1.1 },
  h2: { fontSize: 36, fontWeight: 700, lineHeight: 1.2 },
  h3: { fontSize: 28, fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: 20, fontWeight: 500, lineHeight: 1.5 },
  h6: { fontSize: 16, fontWeight: 500, lineHeight: 1.6 },
}

export default function HeadingBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const level = (props.level as string) || 'h2'
  const text = (props.text as string) || 'Heading'
  const textAlign = (props.textAlign as string) || 'left'

  const style: React.CSSProperties = {
    ...(headingStyles[level] || headingStyles.h2),
    color: (styles.color as string) || '#111827',
    textAlign: textAlign as React.CSSProperties['textAlign'],
    margin: 0,
  }

  return createElement(level, { style }, text)
}
