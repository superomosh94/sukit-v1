'use client';

import React, { useState, useRef, useEffect, type ReactNode } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface CanvasContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
}

export function CanvasContextMenu({ items, children }: CanvasContextMenuProps) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClick = () => setMenuPos(null);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPos(null);
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={ref} onContextMenu={handleContextMenu}>
      {children}
      {menuPos && (
        <div
          className="fixed z-[9999] min-w-[180px] bg-popover border border-border rounded-lg shadow-xl py-1"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.id} className="h-px bg-border my-1" />
            ) : (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setMenuPos(null);
                  }
                }}
                disabled={item.disabled}
                className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <kbd className="text-[10px] text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
