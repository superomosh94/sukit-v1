'use client';

import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

export function ToastUndo(
  message: string,
  onUndo: () => void,
  duration?: number
) {
  return toast(message, {
    icon: <RotateCcw size={16} />,
    duration: duration || 5000,
    action: { label: 'Undo', onClick: onUndo },
  });
}
