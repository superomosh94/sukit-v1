'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface ModalStackEntry {
  id: string;
  component: ReactNode;
}

interface ModalStackContextValue {
  push: (id: string, component: ReactNode) => void;
  pop: (id?: string) => void;
  clear: () => void;
}

const ModalStackContext = createContext<ModalStackContextValue | null>(null);

export function useModalStack() {
  const ctx = useContext(ModalStackContext);
  if (!ctx) throw new Error('useModalStack must be used within ModalStack');
  return ctx;
}

export interface ModalStackProps {
  children: ReactNode;
}

export function ModalStack({ children }: ModalStackProps) {
  const [stack, setStack] = useState<ModalStackEntry[]>([]);

  const push = useCallback((id: string, component: ReactNode) => {
    setStack((prev) => [...prev, { id, component }]);
  }, []);

  const pop = useCallback((id?: string) => {
    setStack((prev) => {
      if (id) return prev.filter((entry) => entry.id !== id);
      return prev.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => setStack([]), []);

  return (
    <ModalStackContext.Provider value={{ push, pop, clear }}>
      {children}
      {stack.map((entry) => (
        <div key={entry.id} className="modal-stack-item">
          {entry.component}
        </div>
      ))}
    </ModalStackContext.Provider>
  );
}
