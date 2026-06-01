'use client';

import { useState } from 'react';
import { cn } from '../utils/cn';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
  onSuccess?: (provider: string) => void;
  className?: string;
}

const PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    icon: 'G',
    bg: 'bg-white text-gray-900 border hover:bg-gray-50',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: 'GH',
    bg: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    bg: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: '',
    bg: 'bg-black text-white hover:bg-gray-900',
  },
  {
    id: 'twitter',
    label: 'Twitter',
    icon: 'X',
    bg: 'bg-black text-white hover:bg-gray-900',
  },
];

export function SocialLoginButtons({
  mode = 'login',
  onSuccess,
  className,
}: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (provider: string) => {
    setLoading(provider);
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
      onSuccess?.(provider);
    } catch (err) {
      console.error(`${provider} login failed:`, err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-card px-2">
            {mode === 'login' ? 'Or continue with' : 'Or sign up with'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PROVIDERS.map(({ id, label, icon, bg }) => (
          <button
            key={id}
            onClick={() => handleLogin(id)}
            disabled={loading !== null}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              bg,
              loading === id && 'opacity-50'
            )}
            title={label}
          >
            <span className="text-sm font-bold">{icon}</span>
            <span className="text-[10px]">
              {loading === id ? '...' : label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
