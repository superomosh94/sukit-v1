'use client'

import type { Block } from '@/lib/builder/types'

interface BreadcrumbItem {
  label: string
  url: string
}

export default function BreadcrumbBlock({ block }: { block: Block }) {
  const { props, styles } = block
  const items = (props.items as BreadcrumbItem[]) || []
  const separator = (props.separator as string) || '/'
  const fontSize = (styles.fontSize as number) ?? 14

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize,
        color: '#6b7280',
        padding: '8px 0',
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: '#d1d5db' }}>{separator}</span>}
          {item.url ? (
            <a
              href={item.url}
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </a>
          ) : (
            <span style={{ color: '#111827', fontWeight: 500 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
