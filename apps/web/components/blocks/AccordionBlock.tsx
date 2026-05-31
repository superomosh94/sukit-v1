'use client'

import type { Block } from '@/lib/builder/types'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  title: string
  content: string
  defaultOpen?: boolean
}

interface AccordionBlockProps {
  block: Block
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [item.content])

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: isOpen ? '#f9fafb' : '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 500,
          color: '#111827',
          textAlign: 'left',
        }}
      >
        {item.title}
        <ChevronDown
          size={18}
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      <div
        style={{
          maxHeight: isOpen ? height : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div ref={contentRef} style={{ padding: '12px 16px', fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
          {item.content}
        </div>
      </div>
    </div>
  )
}

export default function AccordionBlock({ block }: AccordionBlockProps) {
  const { props } = block

  const items = (props.items as AccordionItem[]) || []
  const allowMultiple = !!props.allowMultiple

  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    items.forEach((item, i) => {
      if (item.defaultOpen) initial.add(i)
    })
    return initial
  })

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        if (!allowMultiple) next.clear()
        next.add(index)
      }
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div style={{ color: '#9ca3af', fontSize: 14, padding: 16, textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: 8 }}>
        Add accordion items
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <AccordionPanel
          key={i}
          item={item}
          isOpen={openItems.has(i)}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  )
}
