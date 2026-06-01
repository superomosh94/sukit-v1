'use client';

import { useState, useEffect } from 'react';

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [key, setKey] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    fetch('/api/marketplace/licenses')
      .then((r) => r.json())
      .then(setLicenses);
  }, []);

  async function activate() {
    await fetch('/api/marketplace/licenses/activate', {
      method: 'POST',
      body: JSON.stringify({ licenseKey: key, domain }),
    });
    setKey('');
    setDomain('');
    const res = await fetch('/api/marketplace/licenses');
    setLicenses(await res.json());
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Licenses</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="License key"
          className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
        />
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourdomain.com"
          className="flex-1 px-3 py-2 border rounded-md text-sm"
        />
        <button
          onClick={activate}
          disabled={!key || !domain}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Activate
        </button>
      </div>
      {licenses.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No licenses yet. Activate a license key above.
        </p>
      )}
    </div>
  );
}
