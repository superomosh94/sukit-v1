'use client';

import type { Block } from '../types';
import { useState } from 'react';

interface Tab {
  label: string;
  content: string;
}

interface TabsBlockProps {
  block: Block;
}

export default function TabsBlock({ block }: TabsBlockProps) {
  const { props } = block;

  const tabs = (props.tabs as Tab[]) || [];
  const defaultTab = (props.defaultTab as number) ?? 0;

  const [active, setActive] = useState(defaultTab);

  if (tabs.length === 0) {
    return (
      <div
        style={{
          color: '#9ca3af',
          fontSize: 14,
          padding: 16,
          textAlign: 'center',
          border: '1px dashed #d1d5db',
          borderRadius: 8,
        }}
      >
        Add tabs
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          gap: 0,
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: active === i ? 600 : 400,
              color: active === i ? '#3b82f6' : '#6b7280',
              borderBottom:
                active === i ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: '16px 0',
          fontSize: 14,
          color: '#374151',
          lineHeight: 1.6,
        }}
      >
        {tabs[active]?.content || ''}
      </div>
    </div>
  );
}
