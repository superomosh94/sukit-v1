'use client';

import React, { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: string | number;
}

export interface SidebarMenuProps {
  items: MenuItem[];
  className?: string;
}

export function SidebarMenu({ items, className }: SidebarMenuProps) {
  return (
    <nav className={`space-y-0.5 ${className || ''}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`flex items-center justify-between w-full px-3 py-1.5 text-sm rounded-md transition-colors ${
              item.active
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50 text-foreground'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon size={16} />}
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
