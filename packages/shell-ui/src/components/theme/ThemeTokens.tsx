'use client';

import React, { type ReactNode } from 'react';

export interface ThemeTokensProps {
  children: ReactNode;
  tokens?: Record<string, string>;
}

export function ThemeTokens({ children, tokens }: ThemeTokensProps) {
  const style = tokens
    ? Object.entries(tokens)
        .map(([key, value]) => `--${key}: ${value}`)
        .join(';')
    : undefined;

  return (
    <div
      style={
        style
          ? { [style.split(':')[0].trim()]: style.split(':')[1]?.trim() }
          : undefined
      }
    >
      {children}
    </div>
  );
}
