'use client';

import { useEffect, useState } from 'react';
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Power,
  PowerOff,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

const EVENTS = [
  { value: 'site:created', label: 'Site Created' },
  { value: 'site:deleted', label: 'Site Deleted' },
  { value: 'page:published', label: 'Page Published' },
  { value: 'page:created', label: 'Page Created' },
  { value: 'media:uploaded', label: 'Media Uploaded' },
  { value: 'deploy:started', label: 'Deploy Started' },
  { value: 'deploy:completed', label: 'Deploy Completed' },
  { value: 'deploy:failed', label: 'Deploy Failed' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sukit-webhooks');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sukit-webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  const toggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send real-time notifications to external services when events happen
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Add Webhook
        </button>
      </div>

      {webhooks.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Webhook className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No webhooks configured
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create webhooks to integrate with Slack, Discord, or custom
            endpoints.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      webhook.active
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Webhook className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{webhook.name}</h3>
                      <button
                        onClick={() => toggleActive(webhook.id)}
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          webhook.active
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {webhook.active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {webhook.url}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(webhook.url, webhook.id)}
                    className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                    title="Copy URL"
                  >
                    {copied === webhook.id ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {webhook.lastTriggeredAt && (
                <p className="mt-3 text-[10px] text-muted-foreground border-t pt-2">
                  Last triggered:{' '}
                  {new Date(webhook.lastTriggeredAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddWebhookDialog
          onClose={() => setShowAdd(false)}
          onAdd={(w) => {
            setWebhooks((prev) => [...prev, w]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddWebhookDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (w: WebhookItem) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['page:published']);

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[500px] rounded-lg border bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-medium">Add Webhook</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
              placeholder="Slack Notifications"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Payload URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs font-mono"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Events
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {EVENTS.map((event) => (
                <button
                  key={event.value}
                  onClick={() => toggleEvent(event.value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-xs text-left transition-colors',
                    events.includes(event.value)
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'hover:bg-accent'
                  )}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (!name.trim() || !url.trim() || events.length === 0) return;
              onAdd({
                id: `wh-${Date.now()}`,
                name: name.trim(),
                url: url.trim(),
                events,
                active: true,
                createdAt: new Date().toISOString(),
              });
            }}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Create Webhook
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
