'use client';

import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

export default function AddPluginPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Plugin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse the marketplace to find and install plugins
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
        <Package className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">Browse the Module Marketplace</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Discover and install plugins from our curated marketplace
        </p>
        <button
          onClick={() => router.push('/modules/marketplace')}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open Marketplace
        </button>
      </div>

      {/* Upload and URL install coming soon */}
    </div>
  );
}
