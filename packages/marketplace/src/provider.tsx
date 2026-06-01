'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { SukitKernel } from '@sukit/core';
import { MarketplaceLayer } from './index';
import { useMarketplaceStore } from './store';

interface MarketplaceContextValue {
  marketplace: MarketplaceLayer;
  kernel: SukitKernel;
  initialized: boolean;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export interface MarketplaceProviderProps {
  kernel: SukitKernel;
  children: ReactNode;
}

export function MarketplaceProvider({
  kernel,
  children,
}: MarketplaceProviderProps) {
  const [marketplace] = useState(() => new MarketplaceLayer(kernel));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    marketplace.initialize().then(() => setInitialized(true));
    return () => {
      marketplace.destroy();
    };
  }, [marketplace]);

  return (
    <MarketplaceContext.Provider value={{ marketplace, kernel, initialized }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx)
    throw new Error(
      'useMarketplaceContext must be used within a MarketplaceProvider'
    );
  return ctx;
}

export function useMarketplace(): MarketplaceLayer {
  return useMarketplaceContext().marketplace;
}

export function useMarketplaceReady(): boolean {
  return useMarketplaceContext().initialized;
}
