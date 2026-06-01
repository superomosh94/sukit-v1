'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  read: boolean;
  time: Date;
  onClick?: () => void;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onClear?: (id: string) => void;
  onClearAll?: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onClear,
  onClearAll,
}: NotificationCenterProps) {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer transition-colors ${!n.read ? 'bg-accent/20' : ''}`}
                  onClick={() => {
                    onMarkRead?.(n.id);
                    n.onClick?.();
                  }}
                >
                  <div
                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {n.description}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {n.time.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear?.(n.id);
                    }}
                    className="p-0.5 rounded hover:bg-accent opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
