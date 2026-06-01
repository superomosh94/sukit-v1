'use client';

import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { cn } from '../utils/cn';

interface LoginPageProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  onResetPasswordClick?: () => void;
  className?: string;
}

export function LoginPage({
  onSuccess,
  onRegisterClick,
  onResetPasswordClick,
  className,
}: LoginPageProps) {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
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
          <LogIn className="size-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
              required
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
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {onResetPasswordClick && (
          <button
            type="button"
            onClick={onResetPasswordClick}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            Forgot your password?
          </button>
        )}
      </form>

      <SocialLoginButtons mode="login" />

      {onRegisterClick && (
        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <button
            onClick={onRegisterClick}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}
