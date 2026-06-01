'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface ReducedMotionContextValue {
  enabled: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  enabled: false,
});

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

export interface ReducedMotionProps {
  children: ReactNode;
}

export function ReducedMotion({ children }: ReducedMotionProps) {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(mq.matches);
    const handler = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <ReducedMotionContext.Provider value={{ enabled }}>
      <div className={enabled ? 'reduce-motion' : ''}>{children}</div>
    </ReducedMotionContext.Provider>
  );
}
