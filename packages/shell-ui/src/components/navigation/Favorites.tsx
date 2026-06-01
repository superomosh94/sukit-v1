'use client';

import React from 'react';
import { Star, type LucideIcon } from 'lucide-react';

export interface FavoriteItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

export interface FavoritesProps {
  items: FavoriteItem[];
  className?: string;
}

export function Favorites({ items, className }: FavoritesProps) {
  if (items.length === 0) return null;

  return (
    <div className={`space-y-0.5 ${className || ''}`}>
      <div className="flex items-center gap-1 px-3 py-1">
        <Star size={12} className="text-yellow-500" />
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
          Favorites
        </span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
          >
            {Icon && <Icon size={14} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
