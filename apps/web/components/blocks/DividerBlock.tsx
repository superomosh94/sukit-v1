'use client'

import type { Block } from '@/lib/builder/types'

interface DividerBlockProps {
  block: Block
}

export default function DividerBlock({ block }: DividerBlockProps) {
  const { props } = block

  const lineStyle = (props.style as string) || 'solid'
  const color = (props.color as string) || '#d1d5db'
  const thickness = (props.thickness as string) || '1px'
  const width = (props.width as string) || '100%'

  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${thickness} ${lineStyle} ${color}`,
        width,
        margin: '16px 0',
      }}
    />
  )
}
