'use client';

import { createContext } from 'react';
import type { SukitKernel } from '@sukit/core';
import type { SlotRegistry } from '../slots/SlotRegistry';

export interface ShellContextValue {
  kernel: SukitKernel;
  slotRegistry: SlotRegistry;
}

export const ShellContext = createContext<ShellContextValue | null>(null);
