'use client';

import React from 'react';
import { useShell } from '../hooks/useShell';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

export function UserMenu() {
  const { kernel } = useShell();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="User menu"
      >
        <UserIcon size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={() => {
              kernel.events.emit('ui:open-settings');
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Settings size={14} />
            Settings
          </button>
          <hr className="border-border my-1" />
          <button
            onClick={() => kernel.events.emit('auth:logout')}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-red-500"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
