'use client';

import { toast } from 'sonner';

export interface ToastDurationProps {
  message: string;
  duration: number;
  description?: string;
}

export function ToastDuration({
  message,
  duration,
  description,
}: ToastDurationProps) {
  return toast(message, { duration, description });
}
