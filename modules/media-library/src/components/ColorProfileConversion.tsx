'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../utils/cn';

const COLOR_PROFILES = [
  { value: 'srgb', label: 'sRGB' },
  { value: 'display-p3', label: 'Display P3' },
  { value: 'adobergb', label: 'Adobe RGB' },
  { value: 'none', label: 'None (Keep original)' },
];

interface ColorProfileConversionProps {
  onChange?: (profile: string) => void;
  className?: string;
}

export function ColorProfileConversion({
  onChange,
  className,
}: ColorProfileConversionProps) {
  const [profile, setProfile] = useState('srgb');

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Palette className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Color Profile
        </span>
      </div>
      <div className="flex gap-2">
        {COLOR_PROFILES.map((p) => (
          <button
            key={p.value}
            onClick={() => {
              setProfile(p.value);
              onChange?.(p.value);
            }}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              profile === p.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
