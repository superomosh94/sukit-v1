'use client';

import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ToolbarDropdownProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function ToolbarDropdown({
  label,
  icon,
  children,
}: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-accent transition-colors"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {children}
        </div>
      )}
    </div>
  );
}

export interface ToolbarDropdownItemProps {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export function ToolbarDropdownItem({
  onClick,
  children,
  disabled,
}: ToolbarDropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors"
    >
      {children}
    </button>
  );
}
