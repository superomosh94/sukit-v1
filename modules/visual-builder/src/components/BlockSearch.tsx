'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { blockRegistry } from '../block-registry';
import { cn } from '../utils/cn';

const CATEGORIES = ['All', 'Layout', 'Content', 'Media', 'Forms', 'Advanced'];

interface BlockSearchProps {
  onSelect?: (type: string) => void;
  className?: string;
}

export function BlockSearch({ onSelect, className }: BlockSearchProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const blocks = useMemo(() => {
    const all = blockRegistry.getAllBlockTypes();
    return all.filter((b) => {
      const matchesCategory = category === 'All' || b.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.label.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="relative p-3">
        <Search className="absolute left-5 top-5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search blocks by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-5 top-5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex gap-1 border-b px-3 py-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {blocks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No blocks found
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {blocks.map((block) => (
              <button
                key={block.type}
                onClick={() => onSelect?.(block.type)}
                className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-lg">{block.icon}</span>
                </div>
                <span className="text-xs font-medium">{block.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
