'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';

export interface QuickFindItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onClick: () => void;
}

export interface QuickFindProps {
  items: QuickFindItem[];
  placeholder?: string;
}

export function QuickFind({
  items,
  placeholder = 'Quick find...',
}: QuickFindProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded text-muted-foreground">
            <Command size={12} className="inline" />K
          </kbd>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
                {item.shortcut && (
                  <kbd className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
