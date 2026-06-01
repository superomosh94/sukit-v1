import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { webhookApi } from '../services/api';
import { cn } from '../utils/cn';
export function WebhookLogs() {
  const [logs, setL] = useState<any[]>([]);
  const [hooks, setH] = useState<any[]>([]);
  const [filter, setF] = useState('');
  useEffect(() => {
    webhookApi.getLogs().then(setL);
    webhookApi.list().then(setH);
  }, []);
  const filtered = filter ? logs.filter((l) => l.webhookId === filter) : logs;
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhook Logs</h1>
        </div>
        <select
          value={filter}
          onChange={(e) => setF(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">All Webhooks</option>
          {hooks.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-3 font-medium">Event</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Duration</th>
              <th className="p-3 font-medium">Attempt</th>
              <th className="p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr
                key={l.id}
                className="border-b last:border-0 hover:bg-gray-50 text-sm"
              >
                <td className="p-3">{l.event}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      'flex items-center gap-1',
                      l.status < 300 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {l.status < 300 ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {l.status}
                  </span>
                </td>
                <td className="p-3">{l.duration}ms</td>
                <td className="p-3">{l.attempt}</td>
                <td className="p-3 text-gray-500">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
