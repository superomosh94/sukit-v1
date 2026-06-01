'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  Book,
  MessageCircle,
  FileText,
  LifeBuoy,
  Keyboard,
} from 'lucide-react';

export interface HelpMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface HelpMenuProps {
  items?: HelpMenuItem[];
}

const defaultItems: HelpMenuItem[] = [
  {
    id: 'docs',
    label: 'Documentation',
    icon: <Book size={14} />,
    onClick: () => window.open('/docs', '_blank'),
  },
  {
    id: 'tutorials',
    label: 'Tutorials',
    icon: <FileText size={14} />,
    onClick: () => window.open('/tutorials', '_blank'),
  },
  {
    id: 'shortcuts',
    label: 'Keyboard Shortcuts',
    icon: <Keyboard size={14} />,
    onClick: () => {},
  },
  {
    id: 'support',
    label: 'Get Support',
    icon: <LifeBuoy size={14} />,
    onClick: () => window.open('/support', '_blank'),
  },
  {
    id: 'feedback',
    label: 'Send Feedback',
    icon: <MessageCircle size={14} />,
    onClick: () => {},
  },
];

export function HelpMenu({ items = defaultItems }: HelpMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
