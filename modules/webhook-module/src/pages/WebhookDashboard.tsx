import { useEffect, useState } from 'react';
import {
  Plus,
  Webhook,
  Slack,
  Github,
  Globe,
  Trash2,
  TestTube,
} from 'lucide-react';
import { webhookApi } from '../services/api';
import { cn } from '../utils/cn';
export function WebhookDashboard() {
  const [hooks, setH] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    name: '',
    url: '',
    events: [],
    secret: '',
    active: true,
    integration: '',
    retries: 3,
  });
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setH(await webhookApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await webhookApi.create(f);
    setF({
      name: '',
      url: '',
      events: [],
      secret: '',
      active: true,
      integration: '',
      retries: 3,
    });
    setSF(false);
    load();
  };
  const integrations = [
    'slack',
    'discord',
    'teams',
    'github',
    'gitlab',
    'zapier',
    'make',
    'pagerduty',
    'twilio',
    'sendgrid',
    'datadog',
    'new-relic',
    'custom',
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-gray-500 text-sm">
            Manage webhook endpoints and integrations
          </p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Webhook name"
            className="w-full p-2 border rounded text-sm"
          />
          <input
            value={f.url}
            onChange={(e) => setF({ ...f, url: e.target.value })}
            placeholder="Endpoint URL"
            className="w-full p-2 border rounded text-sm font-mono"
          />
          <div className="flex gap-2">
            <select
              value={f.integration}
              onChange={(e) => setF({ ...f, integration: e.target.value })}
              className="p-2 border rounded text-sm"
            >
              <option value="">Custom</option>
              {integrations.map((i) => (
                <option key={i} value={i}>
                  {i.charAt(0).toUpperCase() + i.slice(1)}
                </option>
              ))}
            </select>
            <input
              value={f.secret}
              onChange={(e) => setF({ ...f, secret: e.target.value })}
              placeholder="Secret"
              className="flex-1 p-2 border rounded text-sm"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        {hooks.map((h) => (
          <div
            key={h.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{h.name}</span>
                {h.integration && (
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                    {h.integration}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                {h.url}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border',
                  h.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {h.active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={async () => {
                  await webhookApi.test(h.id!);
                }}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
              >
                <TestTube className="w-3 h-3 inline mr-1" />
                Test
              </button>
              <button
                onClick={async () => {
                  await webhookApi.delete(h.id!);
                  load();
                }}
                className="p-1 hover:bg-red-50 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
