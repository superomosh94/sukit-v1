'use client'

import type { Block } from '@/lib/builder/types'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface MenuItem {
  label: string
  url: string
}

export default function MenuBlock({ block }: { block: Block }) {
  const { props } = block
  const items = (props.items as MenuItem[]) || []
  const alignment = (props.alignment as string) || 'left'
  const [open, setOpen] = useState(false)

  const linkStyle: React.CSSProperties = {
    color: '#374151',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    padding: '8px 16px',
    transition: 'color 0.2s',
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'space-between',
        padding: '12px 0',
        width: '100%',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
        }}
        className="md:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
        className={open ? 'flex-col md:flex-row' : 'flex-row'}
      >
        {items.map((item, i) => (
          <a key={i} href={item.url} style={linkStyle}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
