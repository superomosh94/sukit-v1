'use client'

import type { Block } from '@/lib/builder/types'

interface SpacerBlockProps {
  block: Block
}

export default function SpacerBlock({ block }: SpacerBlockProps) {
  const height = (block.props.height as string) || '40px'

  return <div style={{ height, width: '100%' }} />
}
