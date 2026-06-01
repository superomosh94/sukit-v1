'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface LargeTextModeContextValue {
  enabled: boolean;
  toggle: () => void;
  scale: number;
}

const LargeTextModeContext = createContext<LargeTextModeContextValue>({
  enabled: false,
  toggle: () => {},
  scale: 1,
});

export function useLargeTextMode() {
  return useContext(LargeTextModeContext);
}

export interface LargeTextModeProps {
  children: ReactNode;
  defaultEnabled?: boolean;
  scale?: number;
}

export function LargeTextMode({
  children,
  defaultEnabled = false,
  scale = 1.25,
}: LargeTextModeProps) {
  const [enabled, setEnabled] = React.useState(defaultEnabled);

  return (
    <LargeTextModeContext.Provider
      value={{ enabled, toggle: () => setEnabled((p) => !p), scale }}
    >
      <div style={enabled ? { fontSize: `${scale * 100}%` } : undefined}>
        {children}
      </div>
    </LargeTextModeContext.Provider>
  );
}
