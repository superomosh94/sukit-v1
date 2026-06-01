'use client';

import { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { cn } from '../utils/cn';

interface ExifStrippingToggleProps {
  defaultEnabled?: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

export function ExifStrippingToggle({
  defaultEnabled = true,
  onChange,
  className,
}: ExifStrippingToggleProps) {
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
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {enabled ? (
        <Shield className="size-4" />
      ) : (
        <ShieldOff className="size-4" />
      )}
      Strip EXIF: {enabled ? 'On' : 'Off'}
    </button>
  );
}
