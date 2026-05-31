'use client'

import type { Block, Column } from '@/lib/builder/types'
import type { ReactNode } from 'react'

interface GridBlockProps {
  block: Block
  children?: ReactNode
}

export default function GridBlock({ block, children }: GridBlockProps) {
  const { props, styles } = block

  const columns = (props.columns as Column[]) || []
  const gap = (props.gap as string) || '16px'
  const minChildWidth = props.minChildWidth as string | undefined

  const gridTemplateColumns = minChildWidth
    ? `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
    : `repeat(${Math.min(columns.length || 1, 6)}, 1fr)`

  const style: Record<string, string | number> = {
    display: 'grid',
    gridTemplateColumns,
    gap,
    ...(styles as Record<string, string | number>),
  }

  return <div style={style}>{children}</div>
}
