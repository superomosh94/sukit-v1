'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';

interface LazyLoadingToggleProps {
  defaultEnabled?: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

export function LazyLoadingToggle({
  defaultEnabled = true,
  onChange,
  className,
}: LazyLoadingToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.(next);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
        enabled
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      Lazy Loading: {enabled ? 'On' : 'Off'}
    </button>
  );
}
