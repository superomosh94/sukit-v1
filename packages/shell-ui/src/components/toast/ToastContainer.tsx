'use client';

import React, { type ReactNode } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  richColors?: boolean;
}

export function ToastContainer({
  position = 'top-right',
  richColors = true,
}: ToastContainerProps) {
  return (
    <SonnerToaster position={position} richColors={richColors} closeButton />
  );
}
