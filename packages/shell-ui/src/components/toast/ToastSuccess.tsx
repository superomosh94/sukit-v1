'use client';

import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export function ToastSuccess(message: string, description?: string) {
  return toast.success(message, {
    description,
    icon: <CheckCircle size={16} />,
  });
}
