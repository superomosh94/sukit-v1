'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Package, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function AddPluginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'upload' | 'url' | 'marketplace'>(
    'marketplace'
  );
  const [url, setUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  const handleUrlInstall = async () => {
    if (!url.trim()) return;
    setInstalling(true);
    // Simulate install
    await new Promise((r) => setTimeout(r, 1500));
    setInstalling(false);
    setDone(true);
    setTimeout(() => router.push('/plugins'), 1500);
  };

  const handleMarketplace = () => {
    router.push('/modules/marketplace');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Plugin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Install a plugin from a file, URL, or the marketplace
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(['marketplace', 'upload', 'url'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              method === m
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m === 'marketplace'
              ? 'From Marketplace'
              : m === 'upload'
                ? 'Upload File'
                : 'From URL'}
          </button>
        ))}
      </div>

      {method === 'marketplace' && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Package className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Browse the Module Marketplace</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Discover and install plugins from our curated marketplace
          </p>
          <button
            onClick={handleMarketplace}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Open Marketplace
          </button>
        </div>
      )}

      {method === 'upload' && (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            setInstalling(true);
            setTimeout(() => {
              setInstalling(false);
              setDone(true);
            }, 1500);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center transition-colors',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 hover:border-primary/50'
          )}
        >
          <Upload className="mb-3 size-10 text-muted-foreground/60" />
          <p className="text-sm font-medium">Drop plugin file here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            .zip or .tar.gz files up to 10MB
          </p>
        </div>
      )}

      {method === 'url' && (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Enter the URL of a plugin package or a public GitHub repository
          </p>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/user/plugin or https://example.com/plugin.zip"
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
            />
            <button
              onClick={handleUrlInstall}
              disabled={!url.trim() || installing || done}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {installing ? 'Installing...' : done ? 'Installed!' : 'Install'}
            </button>
          </div>
          {done && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              <Check className="size-4" />
              Plugin installed successfully. Redirecting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
