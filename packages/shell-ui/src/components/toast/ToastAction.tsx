'use client';

import { toast } from 'sonner';
import type { ReactNode } from 'react';

export interface ToastActionProps {
  message: string;
  label: string;
  onClick: () => void;
  description?: string;
  icon?: ReactNode;
}

export function ToastAction({
  message,
  label,
  onClick,
  description,
  icon,
}: ToastActionProps) {
  return toast(message, {
    description,
    icon,
    action: { label, onClick },
  });
}
