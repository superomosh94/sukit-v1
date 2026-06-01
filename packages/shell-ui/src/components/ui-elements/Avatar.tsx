'use client';

import React from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const iconSizes: Record<string, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  onClick,
}: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className || ''}`}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className="font-medium text-muted-foreground">{initials}</span>
      ) : (
        <User size={iconSizes[size]} className="text-muted-foreground" />
      )}
    </div>
  );
}
