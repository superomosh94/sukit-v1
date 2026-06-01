'use client';

import React, { useState } from 'react';
import { ModalDialog } from './ModalDialog';

export interface ModalPromptProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
}

export function ModalPrompt({
  open,
  onClose,
  onSubmit,
  title = 'Input',
  label,
  placeholder = 'Enter value...',
  defaultValue = '',
  submitLabel = 'Submit',
}: ModalPromptProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <ModalDialog open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {label && <label className="text-sm font-medium">{label}</label>}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit(value);
              onClose();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(value);
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
