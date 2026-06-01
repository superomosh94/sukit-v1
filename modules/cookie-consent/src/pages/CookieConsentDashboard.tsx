import { useEffect, useState } from 'react';
import { Cookie, Settings, BarChart3, Eye, Save } from 'lucide-react';
import { cookieConsentApi } from '../services/api';
import { cn } from '../utils/cn';
export function CookieConsentDashboard() {
  const [config, setC] = useState<any>(null);
  const [stats, setS] = useState<any>(null);
  const [logs, setL] = useState<any[]>([]);
  const [preview, setP] = useState(false);
  useEffect(() => {
    cookieConsentApi.getConfig().then(setC);
    cookieConsentApi.getStats().then(setS);
    cookieConsentApi.getLogs().then(setL);
  }, []);
  const handleSave = async () => {
    if (config) await cookieConsentApi.updateConfig(config);
  };
  if (!config) return null;
  const statItems = [
    { label: 'Total Consents', value: stats?.totalConsents || 0 },
    { label: 'Analytics OK', value: stats?.acceptedAnalytics || 0 },
    { label: 'Marketing OK', value: stats?.acceptedMarketing || 0 },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cookie Consent</h1>
          <p className="text-gray-500 text-sm">
            Manage cookie consent banner and GDPR/CCPA compliance
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
          >
            <span className="text-sm text-gray-500">{s.label}</span>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Banner Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Layout</label>
            <select
              value={config.layout}
              onChange={(e) => setC({ ...config, layout: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="bar">Bar</option>
              <option value="modal">Modal</option>
              <option value="floating">Floating</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Position</label>
            <select
              value={config.position}
              onChange={(e) => setC({ ...config, position: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="bottom">Bottom</option>
              <option value="top">Top</option>
              <option value="center">Center</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Cookie Policy URL</label>
          <input
            value={config.cookiePolicyUrl || ''}
            onChange={(e) =>
              setC({ ...config, cookiePolicyUrl: e.target.value })
            }
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Cookie Categories</label>
          {['necessary', 'analytics', 'marketing', 'preferences'].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(config as any)[c]}
                onChange={(e) => setC({ ...config, [c]: e.target.checked })}
                disabled={c === 'necessary'}
              />
              {c.charAt(0).toUpperCase() + c.slice(1)}
              {c === 'necessary' && (
                <span className="text-xs text-gray-400">(required)</span>
              )}
            </label>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <h3 className="p-3 font-semibold border-b">Consent Logs</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="p-2 font-medium">Visitor</th>
              <th className="p-2 font-medium">Consent</th>
              <th className="p-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 10).map((l) => (
              <tr key={l.id} className="border-b text-sm">
                <td className="p-2 font-mono">
                  {l.visitorId?.slice(0, 12)}...
                </td>
                <td className="p-2">
                  {Object.entries(l.consent || {})
                    .filter(([_, v]) => v)
                    .map(([k]) => k)
                    .join(', ')}
                </td>
                <td className="p-2 text-gray-500">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview && (
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50'
          )}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-gray-500" />
              <span className="text-sm">
                This site uses cookies to improve your experience.
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                Settings
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setP(!preview)}
        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
      >
        <Eye className="w-3 h-3" />
        {preview ? 'Hide' : 'Show'} Preview
      </button>
    </div>
  );
}
