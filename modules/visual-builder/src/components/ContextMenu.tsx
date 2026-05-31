'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  variant?: 'default' | 'destructive';
  onClick: () => void;
}

export function ContextMenu({
  open,
  x,
  y,
  items,
  onClose,
}: {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[100] min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground',
            item.variant === 'destructive' &&
              'text-destructive hover:bg-destructive/10'
          )}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon && <span className="size-3.5 shrink-0">{item.icon}</span>}
          <span className="flex-1 text-left">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-muted-foreground">
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>,
    document.body
  );
}
