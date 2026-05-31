'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const id = crypto.randomUUID();
  toastListeners.forEach((fn) => fn({ id, type, message }));
}

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success:
    'border-green-500 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200',
  error:
    'border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg animate-in slide-in-from-right-2 fade-in duration-200',
              COLORS[toast.type]
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="ml-2 shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
