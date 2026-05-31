'use client'

import type { Block } from '@/lib/builder/types'
import type { ReactNode } from 'react'

export default function ColumnBlock({ block, children }: { block: Block; children?: ReactNode }) {
  const { props } = block
  const span = (props.span as number) ?? 4
  const offset = (props.offset as number) ?? 0
  const flexBasis = `${(span / 12) * 100}%`

  return (
    <div
      style={{
        flex: `0 0 ${flexBasis}`,
        maxWidth: flexBasis,
        marginLeft: offset > 0 ? `${(offset / 12) * 100}%` : undefined,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  )
}
