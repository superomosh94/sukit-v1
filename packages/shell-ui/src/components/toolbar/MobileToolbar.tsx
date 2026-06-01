'use client';

import React, { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export interface MobileToolbarProps {
  children: ReactNode;
  title?: string;
}

export function MobileToolbar({ children, title }: MobileToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <span className="text-sm font-medium">{title || 'Menu'}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-accent"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 bg-card border-b border-border shadow-lg p-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
