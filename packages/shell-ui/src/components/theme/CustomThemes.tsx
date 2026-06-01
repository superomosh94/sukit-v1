'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

export interface CustomTheme {
  name: string;
  label: string;
  variables: Record<string, string>;
}

interface ThemeContextValue {
  customThemes: CustomTheme[];
  addCustomTheme: (theme: CustomTheme) => void;
  removeCustomTheme: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useCustomThemes() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      'useCustomThemes must be used within CustomThemes provider'
    );
  return ctx;
}

export interface CustomThemesProps {
  children: ReactNode;
  initialThemes?: CustomTheme[];
}

export function CustomThemes({
  children,
  initialThemes = [],
}: CustomThemesProps) {
  const [themes, setThemes] = React.useState<CustomTheme[]>(initialThemes);

  const value = {
    customThemes: themes,
    addCustomTheme: (theme: CustomTheme) =>
      setThemes((prev) => [...prev, theme]),
    removeCustomTheme: (name: string) =>
      setThemes((prev) => prev.filter((t) => t.name !== name)),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
