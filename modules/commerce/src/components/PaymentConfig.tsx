'use client';

import { useState } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { useCommerceStore } from '../stores/commerceStore';
import { cn } from '../utils/cn';

interface PaymentConfigProps {
  className?: string;
}

export function PaymentConfig({ className }: PaymentConfigProps) {
  const paymentConfig = useCommerceStore((s) => s.paymentConfig);
  const setPaymentConfig = useCommerceStore((s) => s.setPaymentConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/commerce/payment/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentConfig),
      });
    } catch {}
    setSaving(false);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Payment Configuration</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <Save className="size-3" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border bg-background p-3">
          <h4 className="text-xs font-medium mb-2">Stripe</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Publishable Key"
              value={paymentConfig.stripe?.publishableKey ?? ''}
              onChange={(e) =>
                setPaymentConfig({
                  stripe: {
                    ...paymentConfig.stripe,
                    publishableKey: e.target.value,
                  },
                })
              }
              className="h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
            <input
              type="password"
              placeholder="Secret Key"
              value={paymentConfig.stripe?.secretKey ?? ''}
              onChange={(e) =>
                setPaymentConfig({
                  stripe: {
                    ...paymentConfig.stripe,
                    secretKey: e.target.value,
                  },
                })
              }
              className="h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
          </div>
        </div>

        <div className="rounded-md border bg-background p-3">
          <h4 className="text-xs font-medium mb-2">PayPal</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Client ID"
              value={paymentConfig.paypal?.clientId ?? ''}
              onChange={(e) =>
                setPaymentConfig({
                  paypal: { ...paymentConfig.paypal, clientId: e.target.value },
                })
              }
              className="h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
            <input
              type="password"
              placeholder="Secret"
              value={paymentConfig.paypal?.secret ?? ''}
              onChange={(e) =>
                setPaymentConfig({
                  paypal: { ...paymentConfig.paypal, secret: e.target.value },
                })
              }
              className="h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
