'use client';

import { toast } from 'sonner';

export function ToastProgress(message: string, progress?: number) {
  return toast.loading(message, {
    description:
      progress !== undefined ? `${Math.round(progress * 100)}%` : undefined,
  });
}
