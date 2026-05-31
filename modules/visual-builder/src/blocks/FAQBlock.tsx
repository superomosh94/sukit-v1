'use client';

import type { Block } from '../types';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  block: Block;
}

export default function FAQBlock({ block }: FAQBlockProps) {
  const { props } = block;

  const items = (props.items as FAQItem[]) || [];
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = items.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.length > 3 && (
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {filtered.length === 0 && (
        <div
          style={{
            color: '#9ca3af',
            fontSize: 14,
            textAlign: 'center',
            padding: 24,
          }}
        >
          {search ? 'No matching questions found' : 'Add FAQ items'}
        </div>
      )}

      {filtered.map((item, i) => {
        const actualIndex = items.indexOf(item);
        const isOpen = openIndex === actualIndex;
        return (
          <FAQPanel
            key={actualIndex}
            item={item}
            isOpen={isOpen}
            onToggle={() => toggle(actualIndex)}
          />
        );
      })}
    </div>
  );
}

function FAQPanel({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
    }
  }, [isOpen, item.answer]);

  return (
    <div
      style={{
        borderBottom: '1px solid #e5e7eb',
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
          padding: '14px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 500,
          color: '#111827',
          textAlign: 'left',
          gap: 12,
        }}
      >
        {item.question}
        <ChevronDown
          size={18}
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#9ca3af',
          }}
        />
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? 1000 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            paddingBottom: 14,
            fontSize: 14,
            color: '#4b5563',
            lineHeight: 1.7,
          }}
        >
          {item.answer}
        </div>
      </div>
    </div>
  );
}
