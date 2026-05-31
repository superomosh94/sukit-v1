'use client'

import type { Block } from '@/lib/builder/types'
import { Check } from 'lucide-react'

interface PricingBlockProps {
  block: Block
}

export default function PricingBlock({ block }: PricingBlockProps) {
  const { props } = block

  const name = (props.name as string) || 'Plan'
  const price = (props.price as string) || '0'
  const currency = (props.currency as string) || '$'
  const period = (props.period as string) || '/month'
  const features = (props.features as string[]) || []
  const highlighted = !!props.highlighted
  const ctaText = (props.ctaText as string) || 'Get Started'
  const ctaUrl = props.ctaUrl as string | undefined

  return (
    <div
      style={{
        padding: 32,
        borderRadius: 16,
        background: highlighted ? '#fff' : '#f9fafb',
        border: highlighted
          ? '2px solid #3b82f6'
          : '1px solid #e5e7eb',
        boxShadow: highlighted
          ? '0 4px 20px rgba(59,130,246,0.15)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {highlighted && (
        <span
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#3b82f6',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 14px',
            borderRadius: 20,
          }}
        >
          Popular
        </span>
      )}

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 18, color: '#374151' }}>{currency}</span>
          <span style={{ fontSize: 42, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{price}</span>
          <span style={{ fontSize: 14, color: '#9ca3af' }}>{period}</span>
        </div>
      </div>

      {features.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((feature, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                color: '#374151',
              }}
            >
              <Check size={16} color="#059669" style={{ flexShrink: 0 }} />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <a
        href={ctaUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          background: highlighted ? '#3b82f6' : '#111827',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          textDecoration: 'none',
          marginTop: 'auto',
        }}
      >
        {ctaText}
      </a>
    </div>
  )
}
