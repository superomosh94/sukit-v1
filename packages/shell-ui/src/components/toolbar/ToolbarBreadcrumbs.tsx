'use client';

import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

export interface ToolbarBreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: LucideIcon;
    onClick?: () => void;
  }>;
}

export function ToolbarBreadcrumbs({ items }: ToolbarBreadcrumbsProps) {
  return (
    <nav
      className="flex items-center gap-1 text-sm text-muted-foreground"
      aria-label="Breadcrumbs"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={14} className="text-muted-foreground/50" />
            )}
            {item.href ? (
              <a
                href={item.href}
                className={`flex items-center gap-1 hover:text-foreground transition-colors ${isLast ? 'text-foreground font-medium' : ''}`}
              >
                {Icon && <Icon size={14} />}
                <span>{item.label}</span>
              </a>
            ) : (
              <button
                onClick={item.onClick}
                className={`flex items-center gap-1 hover:text-foreground transition-colors ${isLast ? 'text-foreground font-medium' : ''}`}
              >
                {Icon && <Icon size={14} />}
                <span>{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
