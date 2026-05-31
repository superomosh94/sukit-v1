'use client';

import { useContext } from 'react';
import { ShellContext, type ShellContextValue } from '../contexts/ShellContext';

export function useShell(): ShellContextValue {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}
