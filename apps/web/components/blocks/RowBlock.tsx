'use client'

import type { Block } from '@/lib/builder/types'
import type { ReactNode } from 'react'

export default function RowBlock({ block, children }: { block: Block; children?: ReactNode }) {
  const { props } = block
  const gap = (props.gap as string) || '16px'
  const alignItems = (props.alignItems as string) || 'stretch'
  const justifyContent = (props.justifyContent as string) || 'flex-start'

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        alignItems: alignItems as React.CSSProperties['alignItems'],
        justifyContent: justifyContent as React.CSSProperties['justifyContent'],
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}
