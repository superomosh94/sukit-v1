'use client'

import type { Block } from '@/lib/builder/types'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTopBlock({ block }: { block: Block }) {
  const { props } = block
  const threshold = (props.threshold as number) ?? 300
  const position = (props.position as string) || 'bottom-right'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: 24,
        ...(position === 'bottom-right' ? { right: 24 } : { left: 24 }),
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s, transform 0.3s',
        zIndex: 999,
      }}
    >
      <ArrowUp size={20} />
    </button>
  )
}
