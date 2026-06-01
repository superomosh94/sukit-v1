'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface ThemeInheritanceContextValue {
  parentTheme?: string;
  inherit: boolean;
}

const ThemeInheritanceContext = createContext<ThemeInheritanceContextValue>({
  inherit: true,
});

export function useThemeInheritance() {
  return useContext(ThemeInheritanceContext);
}

export interface ThemeInheritanceProps {
  children: ReactNode;
  parentTheme?: string;
  inherit?: boolean;
}

export function ThemeInheritance({
  children,
  parentTheme,
  inherit = true,
}: ThemeInheritanceProps) {
  return (
    <ThemeInheritanceContext.Provider value={{ parentTheme, inherit }}>
      {children}
    </ThemeInheritanceContext.Provider>
  );
}
