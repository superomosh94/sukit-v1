'use client';

import { toast } from 'sonner';
import { Info } from 'lucide-react';

export function ToastInfo(message: string, description?: string) {
  return toast.info(message, { description, icon: <Info size={16} /> });
}
