'use client';

import { toast } from 'sonner';

export function ToastAccessibility(message: string, description?: string) {
  return toast(message, {
    description,
    duration: 8000,
  });
}
