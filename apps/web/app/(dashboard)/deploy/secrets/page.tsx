'use client';

import { useEffect, useState } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Secret {
  id: string;
  key: string;
  value: string;
  scope: string;
  scopeName?: string;
  createdAt: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadSecrets = async () => {
    try {
      const res = await fetch('/api/settings/secrets');
      const data = await res.json();
      setSecrets(Array.isArray(data) ? data : []);
    } catch {
      setSecrets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecrets();
  }, []);

  const toggleVisible = (id: string) => {
    setVisible((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteSecret = async (id: string) => {
    try {
      await fetch(`/api/settings/secrets?id=${id}`, { method: 'DELETE' });
      setSecrets((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  const addSecret = async (secret: Omit<Secret, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/settings/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secret),
      });
      const created = await res.json();
      setSecrets((prev) => [...prev, created]);
      setShowAdd(false);
    } catch {}
  };

  const filtered =
    filter === 'all' ? secrets : secrets.filter((s) => s.scope === filter);

  const scopeBadge = (scope: string) => {
    const map: Record<string, string> = {
      global: 'bg-blue-500/10 text-blue-600',
      site: 'bg-green-500/10 text-green-600',
      pipeline: 'bg-amber-500/10 text-amber-600',
    };
    return (
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[9px] font-medium',
          map[scope] ?? 'bg-muted text-muted-foreground'
        )}
      >
        {scope}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Environment Secrets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys, tokens, and environment variables securely
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> Add Secret
        </button>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {['all', 'global', 'site', 'pipeline'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              filter === s
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Key className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No secrets found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add API keys and environment variables for your deployments.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {filtered.map((secret) => (
            <div
              key={secret.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Key className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono">
                    {secret.key}
                  </span>
                  {scopeBadge(secret.scope)}
                  {secret.scopeName && (
                    <span className="text-[10px] text-muted-foreground">
                      {secret.scopeName}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs font-mono text-muted-foreground">
                  {visible.has(secret.id)
                    ? secret.value
                    : '•'.repeat(Math.min(secret.value.length, 40))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisible(secret.id)}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {visible.has(secret.id) ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(secret.id, secret.value)}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {copied === secret.id ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => deleteSecret(secret.id)}
                  className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddSecretDialog onClose={() => setShowAdd(false)} onAdd={addSecret} />
      )}
    </div>
  );
}

function AddSecretDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (s: Omit<Secret, 'id' | 'createdAt'>) => void;
}) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<'global' | 'site' | 'pipeline'>('global');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[480px] rounded-lg border bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-medium">Add Secret</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Key Name</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs font-mono"
              placeholder="MY_API_KEY"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Value</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 h-20 w-full rounded-md border bg-background p-2 text-xs font-mono"
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
            >
              <option value="global">Global</option>
              <option value="site">Site</option>
              <option value="pipeline">Pipeline</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (!key.trim() || !value.trim()) return;
              onAdd({ key: key.trim(), value: value.trim(), scope });
            }}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Add Secret
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
