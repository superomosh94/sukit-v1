'use client';

import React, {
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

export interface SlotLazyLoaderProps {
  component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export function SlotLazyLoader({
  component: Component,
  fallback,
  props,
}: SlotLazyLoaderProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        )
      }
    >
      <Component {...props} />
    </Suspense>
  );
}
