"use client";

import { useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function ApiKeysPage() {
  const [keys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");

  async function createKey() {
    if (!newKeyName.trim()) return;

    const res = await fetch("/api/user/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });

    if (res.ok) {
      setNewKeyName("");
      // refresh would happen in real implementation
    }
  }

  async function revokeKey(keyId: string) {
    if (!confirm("Revoke this API key?")) return;
    await fetch(`/api/user/api-keys/${keyId}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Manage API keys for programmatic access
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="New key name..."
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={createKey}
          disabled={!newKeyName.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Create Key
        </button>
      </div>

      {keys.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
          <p className="text-sm text-muted-foreground">
            No API keys created yet
          </p>
        </div>
      )}

      <div className="space-y-2">
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div>
              <p className="font-medium text-sm">{key.name}</p>
              <code className="text-xs text-muted-foreground">
                {key.key.slice(0, 12)}...
              </code>
            </div>
            <button
              onClick={() => revokeKey(key.id)}
              className="rounded px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
