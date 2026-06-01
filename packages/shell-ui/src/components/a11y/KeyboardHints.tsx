'use client';

import React, { useEffect, type ReactNode } from 'react';

export interface KeyboardHintsProps {
  children: ReactNode;
  hints?: Record<string, string>;
}

export function KeyboardHints({ children, hints = {} }: KeyboardHintsProps) {
  useEffect(() => {
    const showHints = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        const entries = Object.entries(hints);
        if (entries.length > 0) {
          console.info('Keyboard shortcuts:');
          entries.forEach(([key, description]) =>
            console.info(`  ${key}: ${description}`)
          );
        }
      }
    };
    window.addEventListener('keydown', showHints);
    return () => window.removeEventListener('keydown', showHints);
  }, [hints]);

  return <>{children}</>;
}
