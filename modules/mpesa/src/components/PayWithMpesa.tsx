'use client';

import { useState } from 'react';
import { useMpesaStore } from '../stores/mpesaStore';

interface PayWithMpesaProps {
  amount: number;
  description?: string;
  accountReference?: string;
  siteId: string;
  orderId?: string;
  onSuccess?: (receipt: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PayWithMpesa({
  amount,
  description = 'Payment',
  accountReference,
  siteId,
  orderId,
  onSuccess,
  onError,
  className = '',
}: PayWithMpesaProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'confirm' | 'processing' | 'done' | 'error'>('phone');
  const [receipt, setReceipt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { startPolling, addTransaction, updateTransaction } = useMpesaStore();

  const ref = accountReference || `INV-${Date.now().toString(36).toUpperCase()}`;

  const handleInitiate = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      setErrorMsg('Enter a valid phone number (e.g. 0712345678)');
      setStep('error');
      return;
    }

    const fullPhone = cleaned.startsWith('0') ? '254' + cleaned.slice(1) : cleaned.startsWith('254') ? cleaned : '254' + cleaned;

    setStep('processing');
    setErrorMsg('');

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          amount,
          accountReference: ref,
          transactionDesc: description,
          siteId,
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.ResponseCode !== '0') {
        setErrorMsg(data.ResponseDescription || data.error || 'STK Push failed');
        setStep('error');
        onError?.(data.ResponseDescription || 'STK Push failed');
        return;
      }

      setStep('done');
      setReceipt(data.mpesaReceiptNumber || data.checkoutRequestId);
      onSuccess?.(data.mpesaReceiptNumber || data.checkoutRequestId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
      setStep('error');
      onError?.(err.message);
    }
  };

  if (step === 'done') {
    return (
      <div className={`rounded-lg border bg-green-50 p-4 text-center ${className}`}>
        <div className="mb-1 text-2xl">✅</div>
        <p className="font-medium text-green-800">Payment initiated</p>
        <p className="mt-1 text-xs text-green-600">
          Check your phone to complete the M-Pesa prompt
        </p>
        {receipt && (
          <p className="mt-2 font-mono text-xs text-green-700">
            Ref: {receipt}
          </p>
        )}
        <button
          onClick={() => { setStep('phone'); setPhone(''); }}
          className="mt-3 text-xs text-green-700 underline"
        >
          Pay again
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className={`rounded-lg border bg-red-50 p-4 text-center ${className}`}>
        <div className="mb-1 text-2xl">❌</div>
        <p className="font-medium text-red-800">Payment failed</p>
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
        <button
          onClick={() => { setStep('phone'); setErrorMsg(''); }}
          className="mt-3 text-xs text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="text-sm font-medium">M-Pesa Phone Number</label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
            +254
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="712345678"
            maxLength={9}
            disabled={step === 'processing'}
            className="block w-full rounded-r-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Amount: KES {amount.toLocaleString()} &mdash; {description}
        </p>
      </div>

      {step === 'confirm' ? (
        <div className="flex gap-2">
          <button
            onClick={() => setStep('phone')}
            className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleInitiate}
            disabled={step === 'processing'}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Confirm KES {amount.toLocaleString()}
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            if (!phone.replace(/[^0-9]/g, '')) {
              setErrorMsg('Enter your phone number');
              setStep('error');
              return;
            }
            setStep('confirm');
          }}
          disabled={step === 'processing'}
          className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {step === 'processing' ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
        </button>
      )}
    </div>
  );
}
