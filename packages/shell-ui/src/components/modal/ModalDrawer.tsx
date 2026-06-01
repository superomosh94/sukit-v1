'use client';

import React, { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  width?: number;
}

export function ModalDrawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = 400,
}: ModalDrawerProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 bottom-0 ${side === 'right' ? 'right-0' : 'left-0'} bg-card border-l border-border shadow-xl overflow-auto`}
        style={{ width }}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
