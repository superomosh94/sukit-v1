'use client'

import type { Block } from '@/lib/builder/types'
import type { ReactNode } from 'react'

export default function SectionBlock({ block, children }: { block: Block; children?: ReactNode }) {
  const { props, styles } = block
  const bgColor = (props.backgroundColor as string) || (styles.backgroundColor as string) || 'transparent'
  const paddingTop = (props.paddingTop as number) ?? 60
  const paddingBottom = (props.paddingBottom as number) ?? 60
  const maxWidth = (props.maxWidth as string) || '1200px'

  return (
    <section
      style={{
        backgroundColor: bgColor,
        paddingTop,
        paddingBottom,
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
          width: '100%',
        }}
      >
        {children}
      </div>
    </section>
  )
}
