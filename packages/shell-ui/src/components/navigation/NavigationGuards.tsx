'use client';

import React, { useState, useCallback, type ReactNode } from 'react';
import { ModalConfirm } from '../modal/ModalConfirm';

export interface NavigationGuard {
  when: () => boolean;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface NavigationGuardsProps {
  children: ReactNode;
  guards: NavigationGuard[];
  onNavigate: () => void;
}

export function NavigationGuards({
  children,
  guards,
  onNavigate,
}: NavigationGuardsProps) {
  const [pendingGuard, setPendingGuard] = useState<NavigationGuard | null>(
    null
  );

  const tryNavigate = useCallback(() => {
    const activeGuard = guards.find((g) => g.when());
    if (activeGuard) {
      setPendingGuard(activeGuard);
    } else {
      onNavigate();
    }
  }, [guards, onNavigate]);

  return (
    <>
      <div onClick={tryNavigate}>{children}</div>
      <ModalConfirm
        open={!!pendingGuard}
        onClose={() => {
          pendingGuard?.onCancel?.();
          setPendingGuard(null);
        }}
        onConfirm={() => {
          pendingGuard?.onConfirm?.();
          setPendingGuard(null);
          onNavigate();
        }}
        title="Unsaved Changes"
        message={pendingGuard?.message || 'You have unsaved changes. Continue?'}
      />
    </>
  );
}
