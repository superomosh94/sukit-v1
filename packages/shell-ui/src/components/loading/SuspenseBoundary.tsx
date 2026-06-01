'use client';

import React, { Suspense, type ReactNode } from 'react';

export interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

export function SuspenseBoundary({
  children,
  fallback,
  name,
}: SuspenseBoundaryProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {name && (
                <p className="text-xs text-muted-foreground">
                  Loading {name}...
                </p>
              )}
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
