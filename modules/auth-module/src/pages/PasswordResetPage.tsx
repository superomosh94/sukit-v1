'use client';

import { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface PasswordResetPageProps {
  onBackToLogin?: () => void;
  className?: string;
}

export function PasswordResetPage({
  onBackToLogin,
  className,
}: PasswordResetPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send reset email');
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={cn('mx-auto w-full max-w-sm space-y-6', className)}>
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        {onBackToLogin && (
          <button
            onClick={onBackToLogin}
            className="flex w-full items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('mx-auto w-full max-w-sm space-y-6', className)}>
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="size-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link
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

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {onBackToLogin && (
        <button
          onClick={onBackToLogin}
          className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to login
        </button>
      )}
    </div>
  );
}
