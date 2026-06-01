'use client';

import { useState } from 'react';
import { Shield, Smartphone, Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface TwoFactorSetupPageProps {
  className?: string;
}

export function TwoFactorSetupPage({ className }: TwoFactorSetupPageProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'done'>('intro');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBegin = async () => {
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      setSecret(data.secret ?? 'JBSWY3DPEHPK3PXP');
      setStep('qr');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!res.ok) throw new Error('Invalid code');
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('mx-auto w-full max-w-md space-y-6', className)}>
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="size-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          Two-Factor Authentication
        </h1>
      </div>

      {step === 'intro' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </p>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <Smartphone className="size-8 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Authenticator App</p>
              <p className="text-xs text-muted-foreground">
                Use Google Authenticator, Authy, or similar
              </p>
            </div>
          </div>
          <button
            onClick={handleBegin}
            className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            Get Started
          </button>
        </div>
      )}

      {step === 'qr' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex size-48 items-center justify-center rounded-lg border bg-muted">
              <Smartphone className="size-16 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-2">QR Code</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Scan this QR code with your authenticator app, or enter the key
            manually:
          </p>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <code className="flex-1 text-xs font-mono">{secret}</code>
            <button
              onClick={handleCopy}
              className="rounded p-1 hover:bg-accent"
            >
              {copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <button
            onClick={() => setStep('verify')}
            className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            I've scanned the code
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code from your authenticator app to verify setup.
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="000000"
            maxLength={6}
            className="h-12 w-full rounded-md border bg-background px-3 text-center text-lg font-mono tracking-[0.5em]"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Verify & Enable
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Shield className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold">2FA Enabled</h2>
          <p className="text-sm text-muted-foreground">
            Your account is now protected with two-factor authentication.
          </p>
        </div>
      )}
    </div>
  );
}
