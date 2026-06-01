'use client';

import React, { type ReactNode } from 'react';

export interface ModalZIndexProps {
  children: ReactNode;
  zIndex?: number;
}

export function ModalZIndex({ children, zIndex = 50 }: ModalZIndexProps) {
  return (
    <div style={{ zIndex }} className="relative">
      {children}
    </div>
  );
}
