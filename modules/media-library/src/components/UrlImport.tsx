'use client';

import { useState } from 'react';
import { Link, Upload } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

interface UrlImportProps {
  folderId?: string;
  className?: string;
}

export function UrlImport({ folderId, className }: UrlImportProps) {
  const uploadFromUrl = useMediaStore((s) => s.uploadFromUrl);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await uploadFromUrl(url.trim(), folderId);
    setUrl('');
    setLoading(false);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Link className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter image URL..."
          className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-xs"
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
        />
      </div>
      <button
        onClick={handleImport}
        disabled={loading || !url.trim()}
        className="flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        <Upload className="size-3" />
        {loading ? 'Importing...' : 'Import'}
      </button>
    </div>
  );
}
