'use client';

import React, { type ReactNode } from 'react';

export interface ModalBackdropProps {
  children: ReactNode;
  blur?: boolean;
  dim?: number;
  onClick?: () => void;
}

export function ModalBackdrop({
  children,
  blur = true,
  dim = 0.6,
  onClick,
}: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        backgroundColor: `rgba(0,0,0,${dim})`,
        backdropFilter: blur ? 'blur(4px)' : undefined,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
