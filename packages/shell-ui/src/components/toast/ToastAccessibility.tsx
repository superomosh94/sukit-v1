'use client';

import { toast } from 'sonner';

export function ToastAccessibility(message: string, description?: string) {
  return toast(message, {
    description,
    important: true,
    duration: 8000,
  });
}
