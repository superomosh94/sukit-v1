'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface ComponentTheme {
  component: string;
  overrides: Record<string, string>;
}

interface ComponentThemeContextValue {
  getTheme: (component: string) => Record<string, string> | undefined;
  setTheme: (component: string, overrides: Record<string, string>) => void;
}

const ComponentThemeContext = createContext<ComponentThemeContextValue | null>(
  null
);

export function useComponentTheme() {
  const ctx = useContext(ComponentThemeContext);
  if (!ctx)
    throw new Error(
      'useComponentTheme must be used within ComponentLevelThemes'
    );
  return ctx;
}

export interface ComponentLevelThemesProps {
  children: ReactNode;
}

export function ComponentLevelThemes({ children }: ComponentLevelThemesProps) {
  const [themes] = React.useState<Map<string, Record<string, string>>>(
    new Map()
  );

  return (
    <ComponentThemeContext.Provider
      value={{
        getTheme: (component) => themes.get(component),
        setTheme: (component, overrides) => {
          themes.set(component, overrides);
        },
      }}
    >
      {children}
    </ComponentThemeContext.Provider>
  );
}
