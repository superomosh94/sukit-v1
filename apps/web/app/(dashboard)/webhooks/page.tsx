'use client';

import { useState } from 'react';
import { Webhook, Loader2 } from 'lucide-react';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const [loading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send real-time notifications to external services when events happen
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
        <Webhook className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No webhooks configured
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Webhook management is coming soon via the API.
        </p>
      </div>
    </div>
  );
}
