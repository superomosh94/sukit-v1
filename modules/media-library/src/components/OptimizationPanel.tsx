'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Check,
  Copy,
  Image,
  FileImage,
  FileType,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize } from '../utils/fileUtils';
import type { MediaVariant, OptimizeOptions } from '../types';

interface OptimizationPanelProps {
  assetId: string;
  currentFormat: string;
  currentSize: number;
  width: number;
  height: number;
  onOptimized: (variant: MediaVariant) => void;
}

interface CompressionRow {
  format: string;
  size: number;
  savingsPercent: number;
}

export function OptimizationPanel({
  assetId,
  currentFormat,
  currentSize,
  width,
  height,
  onOptimized,
}: OptimizationPanelProps) {
  const { optimizeAsset, assets } = useMediaStore();
  const asset = assets.find((a) => a.id === assetId);

  const [webpQuality, setWebpQuality] = useState(80);
  const [avifQuality, setAvifQuality] = useState(80);
  const [converting, setConverting] = useState<'webp' | 'avif' | null>(null);
  const [comparison, setComparison] = useState<CompressionRow[]>([]);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchQuality, setBatchQuality] = useState(80);

  const selectedIds = useMediaStore((s) => s.selectedIds);

  useEffect(() => {
    const baseUrl = asset?.url ?? asset?.thumbnailUrl ?? '';
    if (comparison.length > 0) {
      setOptimizedUrl(baseUrl);
    }
  }, [comparison, asset]);

  const handleConvert = useCallback(
    async (format: 'webp' | 'avif') => {
      setConverting(format);
      const quality = format === 'webp' ? webpQuality : avifQuality;
      const result = await optimizeAsset(assetId, {
        format,
        quality,
      } as OptimizeOptions);
      if (result) {
        onOptimized(result);
        const savingsPercent =
          currentSize > 0
            ? Math.round((1 - result.size / currentSize) * 100 * 10) / 10
            : 0;
        setComparison((prev) => {
          const filtered = prev.filter((r) => r.format !== format);
          return [...filtered, { format, size: result.size, savingsPercent }];
        });
      }
      setConverting(null);
    },
    [assetId, webpQuality, avifQuality, currentSize, optimizeAsset, onOptimized]
  );

  const handleBatchOptimize = useCallback(async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await optimizeAsset(id, {
        format: 'webp',
        quality: batchQuality,
      } as OptimizeOptions);
    }
    const store = useMediaStore.getState();
    await store.emit('media:afterBulkOptimize', { ids: selectedIds });
  }, [selectedIds, batchQuality, optimizeAsset]);

  const handleDownload = useCallback(() => {
    if (!optimizedUrl) return;
    const a = document.createElement('a');
    a.href = optimizedUrl;
    a.download = `optimized-${asset?.filename ?? 'image'}`;
    a.click();
  }, [optimizedUrl, asset]);

  const handleCopyComparison = useCallback(() => {
    const text = comparison
      .map(
        (r) =>
          `${r.format}: ${formatFileSize(r.size)} (${r.savingsPercent >= 0 ? '-' : '+'}${Math.abs(r.savingsPercent)}%)`
      )
      .join('\n');
    navigator.clipboard.writeText(
      `Original: ${formatFileSize(currentSize)}\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [comparison, currentSize]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-2">
          <h3 className="text-sm font-semibold">Image Optimization</h3>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Format</span>
              <p className="font-medium uppercase">{currentFormat}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size</span>
              <p className="font-medium">{formatFileSize(currentSize)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dimensions</span>
              <p className="font-medium">
                {width} &times; {height}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <FileImage className="size-3.5" />
                  WebP Quality
                </span>
                <span className="text-muted-foreground">{webpQuality}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={webpQuality}
                onChange={(e) => setWebpQuality(Number(e.target.value))}
                className="w-full"
              />
              <button
                onClick={() => handleConvert('webp')}
                disabled={converting !== null}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {converting === 'webp' ? (
                  <>
                    <RefreshCw className="size-3 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileType className="size-3" />
                    Convert to WebP
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <FileImage className="size-3.5" />
                  AVIF Quality
                </span>
                <span className="text-muted-foreground">{avifQuality}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={avifQuality}
                onChange={(e) => setAvifQuality(Number(e.target.value))}
                className="w-full"
              />
              <button
                onClick={() => handleConvert('avif')}
                disabled={converting !== null}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {converting === 'avif' ? (
                  <>
                    <RefreshCw className="size-3 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileType className="size-3" />
                    Convert to AVIF
                  </>
                )}
              </button>
            </div>
          </div>

          {comparison.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium">Compression Comparison</h4>
                <button
                  onClick={handleCopyComparison}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="size-3 text-green-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="overflow-hidden rounded-md border text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                        Format
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        Size
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-1.5 font-medium">Original</td>
                      <td className="px-3 py-1.5 text-right">
                        {formatFileSize(currentSize)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-muted-foreground">
                        &mdash;
                      </td>
                    </tr>
                    {comparison.map((row) => (
                      <tr key={row.format} className="border-t">
                        <td className="px-3 py-1.5 font-medium uppercase">
                          {row.format}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          {formatFileSize(row.size)}
                        </td>
                        <td
                          className={cn(
                            'px-3 py-1.5 text-right font-medium',
                            row.savingsPercent > 0
                              ? 'text-green-600'
                              : 'text-red-500'
                          )}
                        >
                          {row.savingsPercent > 0 ? '-' : '+'}
                          {Math.abs(row.savingsPercent)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  <Download className="size-3" />
                  Download Optimized
                </button>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <span>Batch Optimize ({selectedIds.length} selected)</span>
              <RefreshCw
                className={cn(
                  'size-3.5 transition-transform',
                  batchMode && 'rotate-45'
                )}
              />
            </button>
            {batchMode && (
              <div className="mt-2 space-y-2">
                <label className="flex items-center justify-between text-xs">
                  <span>Quality</span>
                  <span className="text-muted-foreground">{batchQuality}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={batchQuality}
                  onChange={(e) => setBatchQuality(Number(e.target.value))}
                  className="w-full"
                />
                <button
                  onClick={handleBatchOptimize}
                  disabled={selectedIds.length === 0}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  <Image className="size-3" />
                  Optimize {selectedIds.length} asset
                  {selectedIds.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
