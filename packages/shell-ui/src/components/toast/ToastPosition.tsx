'use client';

import { toast } from 'sonner';

export type ToastPositionType =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export function ToastPosition(
  message: string,
  position: ToastPositionType = 'top-right'
) {
  return toast(message, { position });
}
