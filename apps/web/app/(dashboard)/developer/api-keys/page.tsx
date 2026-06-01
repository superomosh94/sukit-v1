'use client';

import { useEffect } from 'react';
import { DeveloperApiKeys, useDeveloperPortal } from '@sukit/marketplace';
import type { DeveloperApiKeyData } from '@sukit/marketplace';

export default function DeveloperApiKeysPage() {
  const { developerApiKeys, loadApiKeys } = useDeveloperPortal();

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">API Keys</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage API keys for automated module updates and CI/CD integration.
      </p>
      <DeveloperApiKeys
        keys={developerApiKeys}
        onGenerate={async (data) => {
          const res = await fetch('/api/developer/api-keys', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          return res.json();
        }}
        onRevoke={async (keyId) => {
          await fetch(`/api/developer/api-keys/${keyId}`, { method: 'DELETE' });
          loadApiKeys();
        }}
        onUpdate={async (keyId, data) => {
          await fetch(`/api/developer/api-keys/${keyId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
          loadApiKeys();
        }}
      />
    </div>
  );
}
