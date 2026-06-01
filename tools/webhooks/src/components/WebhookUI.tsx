'use client';

import { useState } from 'react';

export function WebhookTester() {
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState('test:ping');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, event }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-white">
        Test Webhook Endpoint
      </h3>
      <div className="space-y-3">
        <input
          type="url"
          placeholder="https://hooks.example.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
        />
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
        >
          <option value="test:ping">test:ping</option>
          <option value="page:created">page:created</option>
          <option value="page:published">page:published</option>
          <option value="site:created">site:created</option>
          <option value="media:uploaded">media:uploaded</option>
          <option value="form:submitted">form:submitted</option>
          <option value="user:registered">user:registered</option>
        </select>
        <button
          onClick={handleTest}
          disabled={loading || !url}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test'}
        </button>
        {result && (
          <div
            className={`p-3 rounded ${result.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookAnalytics({ webhookId }: { webhookId: string }) {
  const [analytics, setAnalytics] = useState<{
    deliveryRate: number;
    avgLatency: number;
    totalAttempts: number;
  } | null>(null);

  useState(() => {
    fetch(`/api/webhooks/${webhookId}/analytics`)
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => {});
  });

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <div className="p-3 rounded border border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400">Delivery Rate</div>
        <div className="text-lg font-semibold text-white">
          {(analytics.deliveryRate * 100).toFixed(1)}%
        </div>
      </div>
      <div className="p-3 rounded border border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400">Avg Latency</div>
        <div className="text-lg font-semibold text-white">
          {analytics.avgLatency.toFixed(0)}ms
        </div>
      </div>
      <div className="p-3 rounded border border-gray-700 bg-gray-900">
        <div className="text-xs text-gray-400">Total Attempts</div>
        <div className="text-lg font-semibold text-white">
          {analytics.totalAttempts}
        </div>
      </div>
    </div>
  );
}
