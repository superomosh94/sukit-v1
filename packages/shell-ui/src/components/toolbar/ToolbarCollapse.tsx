'use client';

import React, { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface ToolbarCollapseProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ToolbarCollapse({
  label,
  children,
  defaultOpen = true,
}: ToolbarCollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        <span>{label}</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}
