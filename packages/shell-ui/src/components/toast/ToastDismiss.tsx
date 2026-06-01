'use client';

import { toast } from 'sonner';

export function ToastDismiss(id?: string) {
  toast.dismiss(id);
}
