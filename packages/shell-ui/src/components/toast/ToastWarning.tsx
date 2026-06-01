'use client';

import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export function ToastWarning(message: string, description?: string) {
  return toast.warning(message, {
    description,
    icon: <AlertTriangle size={16} />,
  });
}
