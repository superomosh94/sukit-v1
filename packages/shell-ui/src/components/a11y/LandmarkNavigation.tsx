'use client';

import React, { type ReactNode } from 'react';

export interface LandmarkNavigationProps {
  children: ReactNode;
  landmarks?: Array<{ role: string; label: string }>;
}

export function LandmarkNavigation({
  children,
  landmarks = [],
}: LandmarkNavigationProps) {
  return (
    <>
      {landmarks.length > 0 && (
        <nav
          aria-label="Landmark navigation"
          className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-[9999]"
        >
          <ul className="bg-background border border-border rounded-lg p-2 space-y-1">
            {landmarks.map((lm) => (
              <li key={lm.role}>
                <a href={`#${lm.role}`} className="text-sm hover:text-primary">
                  {lm.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {children}
    </>
  );
}
