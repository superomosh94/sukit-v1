'use client';

import type { Block } from '../types';

export default function CodeBlock({ block }: { block: Block }) {
  const { props, styles } = block;
  const code = (props.code as string) || '';
  const language = (props.language as string) || 'javascript';

  const bgColor = (styles.backgroundColor as string) || '#1e293b';
  const textColor = (styles.color as string) || '#e2e8f0';
  const borderRadius = (styles.borderRadius as number) ?? 8;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderRadius,
        overflow: 'hidden',
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span
          style={{ fontSize: 12, opacity: 0.6, textTransform: 'uppercase' }}
        >
          {language}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 12,
            opacity: 0.6,
            cursor: 'pointer',
          }}
        >
          Copy
        </button>
      </div>
      <pre style={{ padding: 16, margin: 0, overflow: 'auto' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
