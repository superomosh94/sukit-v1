'use client';

import { toast } from 'sonner';

export function ToastStack(message: string, id?: string) {
  return toast(message, { id });
}
