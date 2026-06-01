'use client';

import { useState } from 'react';

type WebhookEntry = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastUsed: string | null;
};

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    url: '',
    events: ['site:created'],
    platform: 'slack',
  });

  const platforms = [
    { id: 'slack', name: 'Slack', color: '#4A154B', icon: '💬' },
    { id: 'discord', name: 'Discord', color: '#5865F2', icon: '🎮' },
    { id: 'teams', name: 'Microsoft Teams', color: '#0072C6', icon: '💼' },
    { id: 'zapier', name: 'Zapier', color: '#FF4A00', icon: '⚡' },
    { id: 'make', name: 'Make (Integromat)', color: '#6D28D9', icon: '🔧' },
    { id: 'custom', name: 'Custom', color: '#6B7280', icon: '🔗' },
  ];

  const eventOptions = [
    { value: 'site:created', label: 'Site Created' },
    { value: 'site:updated', label: 'Site Updated' },
    { value: 'page:created', label: 'Page Created' },
    { value: 'page:published', label: 'Page Published' },
    { value: 'page:updated', label: 'Page Updated' },
    { value: 'page:deleted', label: 'Page Deleted' },
    { value: 'media:uploaded', label: 'Media Uploaded' },
    { value: 'module:installed', label: 'Module Installed' },
    { value: 'module:uninstalled', label: 'Module Uninstalled' },
    { value: 'form:submitted', label: 'Form Submitted' },
    { value: 'user:registered', label: 'User Registered' },
    { value: 'backup:completed', label: 'Backup Completed' },
    { value: 'deploy:success', label: 'Deploy Succeeded' },
    { value: 'deploy:failed', label: 'Deploy Failed' },
    { value: '*', label: 'All Events' },
  ];

  const handlePlatformSelect = (id: string) => {
    setForm((prev) => ({
      ...prev,
      platform: id,
      url:
        id === 'slack'
          ? 'https://hooks.slack.com/services/'
          : id === 'discord'
            ? 'https://discord.com/api/webhooks/'
            : id === 'teams'
              ? 'https://outlook.office.com/webhook/'
              : id === 'zapier'
                ? 'https://hooks.zapier.com/hooks/catch/'
                : id === 'make'
                  ? 'https://hook.eu1.make.com/'
                  : '',
    }));
  };

  const handleAdd = () => {
    const entry: WebhookEntry = {
      id: crypto.randomUUID(),
      name: form.name || `${form.platform} webhook`,
      url: form.url,
      events: form.events,
      active: true,
      lastUsed: null,
    };
    setWebhooks((prev) => [...prev, entry]);
    setShowForm(false);
    setTestResult(`Webhook "${entry.name}" registered`);
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTest = async (url: string) => {
    setTestResult('Sending test...');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test:ping',
          message: 'This is a test from SUKIT',
          timestamp: new Date().toISOString(),
        }),
      });
      setTestResult(
        res.ok
          ? '✅ Test successful!'
          : `❌ HTTP ${res.status}: ${res.statusText}`
      );
    } catch (e: any) {
      setTestResult(`❌ ${e.message}`);
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  const toggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };
  const removeWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

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
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + New Webhook
        </button>
      </div>

      {testResult && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {testResult}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">New Webhook</h2>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Platform
            </label>
            <div className="grid grid-cols-6 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlatformSelect(p.id)}
                  className={`p-3 rounded-lg border text-center transition-colors ${form.platform === p.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <p className="text-xs text-gray-700 mt-1 truncate">
                    {p.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Webhook Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="My Webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Webhook URL
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Trigger Events
            </label>
            <div className="flex flex-wrap gap-2">
              {eventOptions.map((e) => (
                <button
                  key={e.value}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      events: prev.events.includes(e.value)
                        ? prev.events.filter((x) => x !== e.value)
                        : [...prev.events, e.value],
                    }))
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.events.includes(e.value) ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              Create Webhook
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {webhooks.map((w) => (
          <div
            key={w.id}
            className={`bg-white rounded-lg border p-4 ${w.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {w.name}
                  </h3>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${w.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {w.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <code className="text-xs text-gray-500 font-mono block mt-1 max-w-md truncate">
                  {w.url}
                </code>
                <div className="flex flex-wrap gap-1 mt-2">
                  {w.events.map((e) => (
                    <span
                      key={e}
                      className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                    >
                      {e}
                    </span>
                  ))}
                </div>
                {w.lastUsed && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last used: {new Date(w.lastUsed).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(w.url)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50"
                >
                  Test
                </button>
                <button
                  onClick={() => toggleActive(w.id)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  {w.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => removeWebhook(w.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {webhooks.length === 0 && !showForm && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-500">No webhooks configured.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Create your first webhook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
