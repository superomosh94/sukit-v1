'use client';

import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { cn } from '../utils/cn';

interface RegisterPageProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
  className?: string;
}

export function RegisterPage({
  onSuccess,
  onLoginClick,
  className,
}: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('mx-auto w-full max-w-sm space-y-6', className)}>
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="size-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with SUKIT
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Name
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              minLength={8}
              className="h-10 w-full rounded-md border bg-background pl-10 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            At least 8 characters
          </p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <SocialLoginButtons mode="register" />

      {onLoginClick && (
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}
