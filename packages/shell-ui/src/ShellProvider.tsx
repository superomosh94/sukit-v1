'use client';

import React, { type ReactNode } from 'react';
import { ShellContext } from './contexts/ShellContext';
import { SlotRegistry } from './slots/SlotRegistry';
import { MainLayout } from './layouts/MainLayout';
import type { SukitKernel } from '@sukit/core';

export interface ShellProviderProps {
  children?: ReactNode;
  kernel: SukitKernel;
}

export function ShellProvider({ children, kernel }: ShellProviderProps) {
  const slotRegistryRef = React.useRef<SlotRegistry | null>(null);

  if (!slotRegistryRef.current) {
    slotRegistryRef.current = new SlotRegistry(kernel);
  }

  return (
    <ShellContext.Provider
      value={{ kernel, slotRegistry: slotRegistryRef.current }}
    >
      <MainLayout>{children}</MainLayout>
    </ShellContext.Provider>
  );
}
