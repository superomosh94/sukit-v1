'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface Site {
  id: string;
  name: string;
  url?: string;
}

export interface SiteSwitcherProps {
  sites: Site[];
  currentSiteId?: string;
  onSwitch: (site: Site) => void;
}

export function SiteSwitcher({
  sites,
  currentSiteId,
  onSwitch,
}: SiteSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = sites.find((s) => s.id === currentSiteId);

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
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <Globe size={16} />
        <span>{current?.name || 'Select site'}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[180px] bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => {
                onSwitch(site);
                setOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <span>{site.name}</span>
              {site.id === currentSiteId && (
                <Check size={14} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
