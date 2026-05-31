'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Star } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { Input } from './ui/input';
import { blockRegistry } from '../block-registry';
import type { BlockRegistration } from '../types';
import { cn } from '../utils/cn';

const CATEGORIES = ['All', 'Layout', 'Content', 'Media', 'Forms', 'Advanced'];
const FAVORITES_KEY = 'sukit-builder-favorites';
const RECENT_KEY = 'sukit-builder-recent';

function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center">
      <div className="size-8 rounded-md bg-muted" />
      <div className="h-3 w-16 rounded bg-muted" />
    </div>
  );
}

function DraggableBlockCard({
  block,
  onDragStart,
}: {
  block: BlockRegistration;
  onDragStart?: (type: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `block-${block.type}`,
      data: { type: block.type },
    });

  const style = useMemo(
    () =>
      transform
        ? {
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            zIndex: 999,
          }
        : undefined,
    [transform]
  );

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex cursor-grab flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
        isDragging && 'opacity-50 shadow-lg'
      )}
      {...listeners}
      {...attributes}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onDragStart={() => onDragStart?.(block.type)}
    >
      {/* Tooltip */}
      {showTooltip && block.description && (
        <div className="absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
          {block.description}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
        </div>
      )}

      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <span className="text-lg">{block.icon}</span>
      </div>
      <span className="text-xs font-medium">{block.label}</span>
    </div>
  );
}

function FavoriteStar({
  type,
  isFavorite,
  onToggle,
}: {
  type: string;
  isFavorite: boolean;
  onToggle: (type: string) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(type);
      }}
      className={cn(
        'absolute right-1 top-1 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100',
        isFavorite && 'opacity-100'
      )}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          'size-3',
          isFavorite
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
        )}
      />
    </button>
  );
}

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(types: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(types));
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(types: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(types.slice(0, 20)));
}

const searchInputRef = { current: null as HTMLInputElement | null };

export function focusBlockSearch() {
  searchInputRef.current?.focus();
  searchInputRef.current?.select();
}

export function BlockPalette() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = useCallback((type: string) => {
    setFavorites((prev) => {
      const next = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      saveFavorites(next);
      return next;
    });
  }, []);

  const trackRecent = useCallback((type: string) => {
    setRecent((prev) => {
      const next = [type, ...prev.filter((t) => t !== type)].slice(0, 20);
      saveRecent(next);
      return next;
    });
  }, []);

  const blocks = useMemo(() => {
    const all = blockRegistry.getAllBlockTypes();
    let filtered = all.filter((b) => {
      const matchesCategory = category === 'All' || b.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.label.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    // Sort favorites to top
    filtered.sort((a, b) => {
      const aFav = favorites.includes(a.type) ? 0 : 1;
      const bFav = favorites.includes(b.type) ? 0 : 1;
      return aFav - bFav;
    });

    return filtered;
  }, [search, category, favorites]);

  const recentBlocks = useMemo(
    () =>
      recent
        .map((type) => blockRegistry.getBlockType(type))
        .filter((b): b is BlockRegistration => !!b),
    [recent]
  );

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-3">
          <Input
            placeholder="Search blocks..."
            disabled
            className="h-9 text-sm"
          />
        </div>
        <div className="flex gap-1 border-b px-3 py-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="h-6 w-14 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            ref={(el) => {
              searchInputRef.current = el;
            }}
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
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
            {cat === 'All' && favorites.length > 0
              ? `All (${favorites.length})`
              : cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Recently used */}
        {recentBlocks.length > 0 && category === 'All' && !search && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">
              Recently Used
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {recentBlocks.slice(0, 4).map((block) => (
                <DraggableBlockCard
                  key={`recent-${block.type}`}
                  block={block}
                  onDragStart={trackRecent}
                />
              ))}
            </div>
          </div>
        )}

        {blocks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No blocks found
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {blocks.map((block) => (
              <div key={block.type} className="group relative">
                <FavoriteStar
                  type={block.type}
                  isFavorite={favorites.includes(block.type)}
                  onToggle={toggleFavorite}
                />
                <DraggableBlockCard block={block} onDragStart={trackRecent} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
