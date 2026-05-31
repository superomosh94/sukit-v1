'use client'

import type { Block } from '@/lib/builder/types'
import { icons } from 'lucide-react'
import React from 'react'

interface IconBlockProps {
  block: Block
}

export default function IconBlock({ block }: IconBlockProps) {
  const { props } = block

  const iconName = (props.iconName as string) || 'Star'
  const size = (props.size as number) ?? 24
  const color = (props.color as string) || 'currentColor'
  const strokeWidth = (props.strokeWidth as number) ?? 2

  const LucideIcon = (icons as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>>)[iconName]

  if (!LucideIcon) {
    return (
      <span style={{ color: '#ef4444', fontSize: 12 }}>
        ?{iconName}
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />
    </span>
  )
}
