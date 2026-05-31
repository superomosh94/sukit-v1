'use client'

import type { Block } from '@/lib/builder/types'
import { Star } from 'lucide-react'

interface TestimonialBlockProps {
  block: Block
}

export default function TestimonialBlock({ block }: TestimonialBlockProps) {
  const { props } = block

  const quote = (props.quote as string) || ''
  const author = (props.author as string) || ''
  const role = (props.role as string) || ''
  const avatar = props.avatar as string | undefined
  const rating = (props.rating as number) ?? 0
  const theme = (props.theme as string) || 'light'

  const isDark = theme === 'dark'

  const cardStyle: Record<string, string | number> = {
    padding: 24,
    borderRadius: 12,
    background: isDark ? '#1f2937' : '#fff',
    color: isDark ? '#f3f4f6' : '#111827',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
  }

  return (
    <div style={cardStyle}>
      {rating > 0 && (
        <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < rating ? '#f59e0b' : 'none'}
              color={i < rating ? '#f59e0b' : '#d1d5db'}
            />
          ))}
        </div>
      )}

      {quote && (
        <blockquote
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            fontStyle: 'italic',
            color: isDark ? '#d1d5db' : '#4b5563',
            margin: 0,
            marginBottom: 16,
          }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: isDark ? '#4b5563' : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#6b7280',
            }}
          >
            {author.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        <div>
          {author && (
            <div style={{ fontWeight: 600, fontSize: 14 }}>{author}</div>
          )}
          {role && (
            <div style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>
              {role}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
