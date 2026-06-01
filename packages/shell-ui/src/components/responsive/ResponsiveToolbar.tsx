'use client';

import React, { type ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface ResponsiveToolbarProps {
  desktopContent: ReactNode;
  mobileContent: ReactNode;
  breakpoint?: number;
}

export function ResponsiveToolbar({
  desktopContent,
  mobileContent,
}: ResponsiveToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex items-center">{desktopContent}</div>
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {menuOpen && (
          <div className="absolute left-0 right-0 top-full bg-card border-b border-border shadow-lg z-50 p-2">
            {mobileContent}
          </div>
        )}
      </div>
    </>
  );
}
