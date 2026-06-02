'use client';

import { useState, useEffect } from 'react';

export default function AdminWebhooksPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [eventOptions, setEventOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setPlatforms(data.webhookPlatforms ?? []);
        setEventOptions(data.webhookEvents ?? []);
      } catch {}
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send real-time notifications to Slack, Discord, Teams, Zapier, and
            more.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Supported Platforms
        </h2>
        <div className="grid grid-cols-6 gap-3">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-lg border border-gray-200 text-center"
            >
              <p className="text-xs font-medium text-gray-700">{p.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Available Events
        </h2>
        <div className="flex flex-wrap gap-2">
          {eventOptions.map((e: any) => (
            <span
              key={e.value}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
            >
              {e.label}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
        Webhook CRUD is available on the main{' '}
        <a
          href="/webhooks"
          className="text-indigo-600 hover:text-indigo-800 underline"
        >
          Webhooks page
        </a>
        .
      </div>
    </div>
  );
}
