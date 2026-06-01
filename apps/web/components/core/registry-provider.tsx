'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createSukitKernel } from '@/lib/core/create-core';
import type { SukitKernel } from '@sukit/core';
import { SukitProvider } from '@sukit/module-sdk';
import { MarketplaceProvider } from '@sukit/marketplace';

const KernelContext = createContext<SukitKernel | null>(null);

export function useKernel(): SukitKernel {
  const ctx = useContext(KernelContext);
  if (!ctx) throw new Error('useKernel must be used within RegistryProvider');
  return ctx;
}

export function RegistryProvider({ children }: { children: ReactNode }) {
  const [kernel] = useState(() => createSukitKernel());

  return (
    <KernelContext.Provider value={kernel}>
      <SukitProvider sukit={kernel}>
        <MarketplaceProvider kernel={kernel}>{children}</MarketplaceProvider>
      </SukitProvider>
    </KernelContext.Provider>
  );
}
