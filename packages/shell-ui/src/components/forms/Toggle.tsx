'use client';

import React from 'react';

export interface ToggleProps {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({
  pressed,
  onPressedChange,
  label,
  disabled,
  size = 'md',
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={`relative inline-flex items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 ${
        size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
      } ${pressed ? 'bg-primary' : 'bg-input'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        } ${pressed ? (size === 'sm' ? 'translate-x-[18px]' : 'translate-x-[22px]') : 'translate-x-0.5'}`}
      />
      {label && <span className="ml-3 text-sm">{label}</span>}
    </button>
  );
}
