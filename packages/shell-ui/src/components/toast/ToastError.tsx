'use client';

import { toast } from 'sonner';
import { XCircle } from 'lucide-react';

export function ToastError(message: string, description?: string) {
  return toast.error(message, { description, icon: <XCircle size={16} /> });
}
