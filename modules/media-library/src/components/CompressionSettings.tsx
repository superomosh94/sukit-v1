'use client';

import { useState } from 'react';
import { FileArchive, FileImage } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

interface CompressionSettingsProps {
  assetId: string;
  className?: string;
}

export function CompressionSettings({
  assetId,
  className,
}: CompressionSettingsProps) {
  const optimizeAsset = useMediaStore((s) => s.optimizeAsset);
  const [quality, setQuality] = useState(80);
  const [mode, setMode] = useState<'lossy' | 'lossless'>('lossy');
  const [format, setFormat] = useState<'webp' | 'avif' | 'original'>('webp');
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimize = async () => {
    setOptimizing(true);
    await optimizeAsset(assetId, {
      quality: mode === 'lossless' ? 100 : quality,
      format,
      stripMetadata: true,
    });
    setOptimizing(false);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <FileArchive className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Compression</h4>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Mode
          </label>
          <div className="mt-1 flex gap-2">
            {(['lossy', 'lossless'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {mode === 'lossy' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-1 h-2 w-full appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Format
          </label>
          <div className="mt-1 flex gap-2">
            {(['webp', 'avif', 'original'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  format === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {f === 'original' ? 'Original' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="w-full rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {optimizing ? 'Optimizing...' : 'Apply Compression'}
        </button>
      </div>
    </div>
  );
}
