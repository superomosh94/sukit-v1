'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface HighContrastModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

const HighContrastModeContext = createContext<HighContrastModeContextValue>({
  enabled: false,
  toggle: () => {},
});

export function useHighContrastMode() {
  return useContext(HighContrastModeContext);
}

export interface HighContrastModeProps {
  children: ReactNode;
  defaultEnabled?: boolean;
}

export function HighContrastMode({
  children,
  defaultEnabled = false,
}: HighContrastModeProps) {
  const [enabled, setEnabled] = React.useState(defaultEnabled);

  return (
    <HighContrastModeContext.Provider
      value={{ enabled, toggle: () => setEnabled((p) => !p) }}
    >
      <div
        className={enabled ? 'high-contrast' : ''}
        data-high-contrast={enabled}
      >
        {children}
      </div>
    </HighContrastModeContext.Provider>
  );
}
