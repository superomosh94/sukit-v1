'use client';

import React, { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModalDialog } from './ModalDialog';

export interface ModalConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ModalConfirm({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ModalConfirmProps) {
  return (
    <ModalDialog open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div
          className={`p-3 rounded-full ${variant === 'destructive' ? 'bg-red-500/10' : 'bg-primary/10'}`}
        >
          <AlertTriangle
            size={24}
            className={
              variant === 'destructive' ? 'text-red-500' : 'text-primary'
            }
          />
        </div>
        <div className="text-sm">{message}</div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-md text-white transition-colors ${
              variant === 'destructive'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {loading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
