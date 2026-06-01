'use client';

import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ToolbarOverflowProps {
  children: ReactNode;
  maxVisible?: number;
}

export function ToolbarOverflow({
  children,
  maxVisible = 5,
}: ToolbarOverflowProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);
  const visible = items.slice(0, maxVisible);
  const overflow = items.slice(maxVisible);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShowOverflow(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="flex items-center">
      {visible}
      {overflow.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="More tools"
          >
            <MoreHorizontal size={16} />
          </button>
          {showOverflow && (
            <div className="absolute right-0 top-full mt-1 min-w-[140px] bg-card border border-border rounded-lg shadow-lg z-50 py-1">
              {overflow}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
