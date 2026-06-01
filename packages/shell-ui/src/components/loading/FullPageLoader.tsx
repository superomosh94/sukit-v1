'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export function FullPageLoader({ message, className }: FullPageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[60vh] ${className || ''}`}
    >
      <Loader2 size={32} className="animate-spin text-primary mb-4" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
