'use client';

import { cn } from '../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  overlay?: boolean;
}

const SIZE_CLASSES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export function LoadingSpinner({
  size = 'md',
  label,
  className,
  overlay = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        className={cn('animate-spin text-primary', SIZE_CLASSES[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
