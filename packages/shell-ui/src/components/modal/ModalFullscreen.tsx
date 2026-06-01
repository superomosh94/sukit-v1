'use client';

import React, { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalFullscreenProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function ModalFullscreen({
  open,
  onClose,
  title,
  children,
}: ModalFullscreenProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="h-full overflow-auto">{children}</div>
    </div>,
    document.body
  );
}
