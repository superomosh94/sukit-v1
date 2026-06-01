'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useShell } from '../../hooks/useShell';

export interface SettingsButtonProps {
  className?: string;
}

export function SettingsButton({ className }: SettingsButtonProps) {
  const { kernel } = useShell();

  return (
    <button
      onClick={() => kernel?.events?.emit?.('ui:open-settings')}
      className={`p-2 rounded-md hover:bg-accent transition-colors ${className || ''}`}
      aria-label="Settings"
    >
      <Settings size={18} />
    </button>
  );
}
