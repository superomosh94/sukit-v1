'use client';

import { useState } from 'react';
import { Fingerprint, Shield } from 'lucide-react';
import { cn } from '../utils/cn';

interface WebAuthnRegisterProps {
  className?: string;
}

export function WebAuthnRegister({ className }: WebAuthnRegisterProps) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const challenge = await fetch('/api/auth/webauthn/register/begin', {
        method: 'POST',
      }).then((r) => r.json());

      const credential = await navigator.credentials.create({
        publicKey: challenge,
      });

      await fetch('/api/auth/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      setRegistered(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register passkey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Fingerprint className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Passkeys / WebAuthn</h3>
      </div>

      {registered ? (
        <div className="flex items-center gap-2 rounded-md bg-green-100 dark:bg-green-900/30 px-3 py-2 text-xs text-green-700 dark:text-green-400">
          <Shield className="size-4" />
          Passkey registered successfully
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            Register a passkey for passwordless authentication using your
            device's biometrics or security key.
          </p>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            <Fingerprint className="size-4" />
            {loading ? 'Registering...' : 'Register Passkey'}
          </button>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </>
      )}
    </div>
  );
}
