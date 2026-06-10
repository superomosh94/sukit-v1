'use client';

import { useState, useEffect } from 'react';
import { useMpesaStore } from '../stores/mpesaStore';

export function MpesaSettings() {
  const { transactions, loading, setLoading, setError, lastError } = useMpesaStore();
  const [tab, setTab] = useState<'settings' | 'transactions'>('settings');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [passkey, setPasskey] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/secrets');
        if (!res.ok) return;
        const data = await res.json();
        const secrets = Array.isArray(data) ? data : [];
        const findSecret = (key: string) => {
          const s = secrets.find((s: any) => s.key === key);
          return s ? '••••••••' : '';
        };
        setConsumerKey(findSecret('mpesa-consumer-key'));
        setConsumerSecret(findSecret('mpesa-consumer-secret'));
        setPasskey(findSecret('mpesa-passkey'));
        setShortCode(findSecret('mpesa-short-code'));

        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const config = await configRes.json();
          setEnvironment(config.mpesaEnvironment || 'sandbox');
          setCallbackUrl(config.mpesaCallbackUrl || '');
        }
      } catch {
        // settings not yet saved
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const saveSecret = async (key: string, value: string) => {
        if (!value || value === '••••••••') return;
        await fetch('/api/settings/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      };

      await Promise.all([
        saveSecret('mpesa-consumer-key', consumerKey),
        saveSecret('mpesa-consumer-secret', consumerSecret),
        saveSecret('mpesa-passkey', passkey),
        saveSecret('mpesa-short-code', shortCode),
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/mpesa/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.success ? 'Connected successfully' : `Failed: ${data.error}`);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-3">
        <button
          onClick={() => setTab('settings')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            tab === 'settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            tab === 'transactions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Consumer Key</label>
              <input
                type="password"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter Daraja consumer key"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Consumer Secret</label>
              <input
                type="password"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter Daraja consumer secret"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Passkey</label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Lipa Na M-PESA Online passkey"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Code</label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g. 174379"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="sandbox">Sandbox (developer)</option>
                <option value="production">Production (live)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Callback URL</label>
              <input
                type="text"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="https://your-domain.com/api/mpesa/callback"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {saved && (
            <p className="text-sm text-green-600">Settings saved successfully</p>
          )}
          {lastError && (
            <p className="text-sm text-red-600">{lastError}</p>
          )}
          {testResult && (
            <p className={`text-sm ${testResult.startsWith('Connected') ? 'text-green-600' : 'text-red-600'}`}>
              {testResult}
            </p>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No M-Pesa transactions yet. Make a payment to see it here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium">Receipt</th>
                    <th className="py-2 pr-4 font-medium">Phone</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Reference</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">
                        {txn.mpesaReceiptNumber || '-'}
                      </td>
                      <td className="py-2 pr-4">{txn.phoneNumber}</td>
                      <td className="py-2 pr-4">
                        {txn.currency} {txn.amount.toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {txn.accountReference}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            txn.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : txn.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : txn.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
