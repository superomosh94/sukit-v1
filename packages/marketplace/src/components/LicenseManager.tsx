'use client';

import { useState } from 'react';
import type { LicenseData } from '../types';

interface LicenseManagerProps {
  licenses: LicenseData[];
  onActivate: (licenseKey: string, domain: string) => Promise<void>;
  onDeactivate: (licenseKey: string, domain: string) => Promise<void>;
  onTransfer: (licenseKey: string, newDomain: string) => Promise<void>;
  loading?: boolean;
}

export function LicenseManager({
  licenses,
  onActivate,
  onDeactivate,
  onTransfer,
  loading,
}: LicenseManagerProps) {
  const [activatingKey, setActivatingKey] = useState('');
  const [domain, setDomain] = useState('');
  const [transferKey, setTransferKey] = useState<string | null>(null);
  const [transferDomain, setTransferDomain] = useState('');

  const activeLicenses = licenses.filter((l) => l.status === 'active');
  const expiredLicenses = licenses.filter((l) => l.status === 'expired');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Activate License
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={activatingKey}
            onChange={(e) => setActivatingKey(e.target.value)}
            placeholder="License key"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={() => {
              onActivate(activatingKey, domain);
              setActivatingKey('');
              setDomain('');
            }}
            disabled={!activatingKey || !domain || loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Activate
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Active Licenses ({activeLicenses.length})
        </h3>
        <div className="space-y-2">
          {activeLicenses.map((license) => (
            <div
              key={license.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-800">
                      {license.key.slice(0, 8)}-****-****-
                      {license.key.slice(-4)}
                    </code>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      {license.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {license.moduleName}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {license.domains.map((d) => (
                      <span
                        key={d}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  {license.expiresAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Expires:{' '}
                      {new Date(license.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTransferKey(license.key);
                      setTransferDomain('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Transfer
                  </button>
                  {license.domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => onDeactivate(license.key, d)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Deactivate {d}
                    </button>
                  ))}
                </div>
              </div>
              {transferKey === license.key && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={transferDomain}
                    onChange={(e) => setTransferDomain(e.target.value)}
                    placeholder="New domain"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <button
                    onClick={() => {
                      onTransfer(license.key, transferDomain);
                      setTransferKey(null);
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setTransferKey(null)}
                    className="px-3 py-1.5 text-xs border rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          {activeLicenses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No active licenses. Enter a license key above to activate.
            </p>
          )}
        </div>
      </div>

      {expiredLicenses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Expired Licenses ({expiredLicenses.length})
          </h3>
          <div className="space-y-2">
            {expiredLicenses.map((license) => (
              <div
                key={license.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-xs font-mono text-gray-500">
                      {license.key.slice(0, 8)}-****-****-
                      {license.key.slice(-4)}
                    </code>
                    <span className="text-xs text-gray-400 ml-2">
                      {license.moduleName}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {license.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
