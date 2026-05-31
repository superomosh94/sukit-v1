'use client'

import type { Block } from '@/lib/builder/types'

export default function ParagraphBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const text = (props.text as string) || ''
  const textAlign = (props.textAlign as string) || 'left'
  const dropCap = !!props.dropCap

  const style: React.CSSProperties = {
    fontSize: (styles.fontSize as number) ?? 16,
    lineHeight: (styles.lineHeight as number) ?? 1.7,
    color: (styles.color as string) || '#374151',
    textAlign: textAlign as React.CSSProperties['textAlign'],
    margin: 0,
  }

  if (dropCap && text.length > 0) {
    return (
      <div style={style}>
        <span
          style={{
            float: 'left',
            fontSize: '3em',
            lineHeight: 1,
            fontWeight: 700,
            marginRight: 8,
            marginTop: 4,
            color: (styles.color as string) || '#111827',
          }}
        >
          {text[0]}
        </span>
        {text.slice(1)}
      </div>
    )
  }

  return <p style={style}>{text}</p>
}
