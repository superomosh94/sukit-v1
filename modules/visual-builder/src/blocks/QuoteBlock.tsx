'use client';

import type { Block } from '../types';

export default function QuoteBlock({ block }: { block: Block }) {
  const { props, styles } = block;
  const text = (props.text as string) || '';
  const author = (props.author as string) || '';

  const borderColor = (styles.borderColor as string) || '#3b82f6';

  return (
    <blockquote
      style={{
        borderLeft: `4px solid ${borderColor}`,
        padding: '16px 24px',
        margin: 0,
        backgroundColor: '#f9fafb',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.6,
          color: '#374151',
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
      {author && (
        <footer
          style={{
            marginTop: 12,
            fontSize: 14,
            color: '#6b7280',
            fontWeight: 500,
          }}
        >
          &mdash; {author}
        </footer>
      )}
    </blockquote>
  );
}
