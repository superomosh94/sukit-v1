'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  category?: string;
  icon?: React.ReactNode;
  execute: () => void;
}

export interface CommandPaletteProps {
  commands: CommandItem[];
}

export function CommandPalette({ commands }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return open ? (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Terminal size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-72 overflow-auto p-2 space-y-0.5">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.execute();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
            >
              {cmd.icon || (
                <Terminal size={14} className="text-muted-foreground" />
              )}
              <div className="flex items-center gap-2">
                <span>{cmd.label}</span>
                {cmd.category && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                    {cmd.category}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;
}
