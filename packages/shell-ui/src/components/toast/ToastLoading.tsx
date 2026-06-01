'use client';

import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ToastLoading(message: string, description?: string) {
  return toast.loading(message, {
    description,
    icon: <Loader2 size={16} className="animate-spin" />,
  });
}
