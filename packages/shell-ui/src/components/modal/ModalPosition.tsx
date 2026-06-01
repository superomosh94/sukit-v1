'use client';

import React, { type ReactNode } from 'react';

export interface ModalPositionProps {
  children: ReactNode;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const positionClasses: Record<string, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-10',
  bottom: 'items-end justify-center pb-10',
  left: 'items-center justify-start pl-4',
  right: 'items-center justify-end pr-4',
};

export function ModalPosition({
  children,
  position = 'center',
}: ModalPositionProps) {
  return (
    <div className={`fixed inset-0 flex ${positionClasses[position]}`}>
      {children}
    </div>
  );
}
