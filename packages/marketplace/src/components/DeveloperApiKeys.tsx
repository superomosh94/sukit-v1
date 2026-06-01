'use client';

import { useState } from 'react';
import type { DeveloperApiKeyData } from '../types';

interface DeveloperApiKeysProps {
  keys: DeveloperApiKeyData[];
  onGenerate: (data: {
    name: string;
    permissions: string[];
  }) => Promise<DeveloperApiKeyData & { rawKey: string }>;
  onRevoke: (keyId: string) => Promise<void>;
  onUpdate: (
    keyId: string,
    data: Partial<{ name: string; permissions: string[] }>
  ) => Promise<void>;
  loading?: boolean;
}

export function DeveloperApiKeys({
  keys,
  onGenerate,
  onRevoke,
  onUpdate,
  loading,
}: DeveloperApiKeysProps) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>(['read']);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const permissionOptions = [
    { value: 'read', label: 'Read', desc: 'View module info and stats' },
    { value: 'write', label: 'Write', desc: 'Update module metadata' },
    {
      value: 'publish',
      label: 'Publish',
      desc: 'Submit new versions and publish',
    },
  ];

  async function handleGenerate() {
    setError('');
    if (!newName.trim()) {
      setError('Please enter a name for this key');
      return;
    }

    try {
      const result = await onGenerate({
        name: newName,
        permissions: newPermissions,
      });
      setGeneratedKey(result.rawKey);
      setShowNew(false);
      setNewName('');
      setNewPermissions(['read']);
    } catch (e: any) {
      setError(e.message || 'Failed to generate key');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Generate Key
        </button>
      </div>

      {generatedKey && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-800 mb-1">
            Your new API key
          </p>
          <p className="text-xs text-amber-700 mb-2">
            Copy this key now. You won't be able to see it again.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded text-sm font-mono break-all">
              {generatedKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedKey);
                setGeneratedKey(null);
              }}
              className="px-3 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {key.name}
                </span>
                {key.revokedAt && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                    Revoked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs text-gray-500 font-mono">
                  {key.key.slice(0, 12)}...
                </code>
                <span className="text-xs text-gray-400">&middot;</span>
                {key.permissions.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                  >
                    {p}
                  </span>
                ))}
              </div>
              {key.lastUsed && (
                <p className="text-xs text-gray-400 mt-1">
                  Last used: {new Date(key.lastUsed).toLocaleDateString()}
                </p>
              )}
            </div>
            {!key.revokedAt && (
              <button
                onClick={() => {
                  if (confirm('Revoke this API key? This cannot be undone.'))
                    onRevoke(key.id);
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
        {keys.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No API keys generated yet.
          </p>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Generate API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., CI/CD Pipeline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(opt.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPermissions((prev) => [...prev, opt.value]);
                          } else {
                            setNewPermissions((prev) =>
                              prev.filter((p) => p !== opt.value)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Generate Key
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
