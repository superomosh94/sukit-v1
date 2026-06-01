'use client';

import React, { useEffect, type ReactNode } from 'react';

export interface ThemeVariablesProps {
  children: ReactNode;
  variables: Record<string, string>;
}

export function ThemeVariables({ children, variables }: ThemeVariablesProps) {
  useEffect(() => {
    const root = document.documentElement;
    const applied: string[] = [];
    for (const [key, value] of Object.entries(variables)) {
      const cssVar = `--${key}`;
      root.style.setProperty(cssVar, value);
      applied.push(cssVar);
    }
    return () => {
      for (const cssVar of applied) {
        root.style.removeProperty(cssVar);
      }
    };
  }, [variables]);

  return <>{children}</>;
}
