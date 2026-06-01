'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Plus, Image, Settings2, Code } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize } from '../utils/fileUtils';
import type { MediaVariant } from '../types';

interface ResponsiveImagePanelProps {
  assetId: string;
  width: number;
  height: number;
  variants: MediaVariant[];
  onVariantsGenerated: (variants: MediaVariant[]) => void;
}

const PRESET_SIZES = [
  { label: 'Thumbnail', width: 150 },
  { label: 'Small', width: 300 },
  { label: 'Medium', width: 600 },
  { label: 'Large', width: 1200 },
  { label: 'XL', width: 2000 },
];

export function ResponsiveImagePanel({
  assetId,
  width,
  height,
  variants,
  onVariantsGenerated,
}: ResponsiveImagePanelProps) {
  const { generateVariants, assets } = useMediaStore();
  const asset = assets.find((a) => a.id === assetId);

  const [customWidth, setCustomWidth] = useState(800);
  const [customMaxHeight, setCustomMaxHeight] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<'srcset' | 'sizes' | 'picture' | null>(
    null
  );

  const handleGenerateVariants = useCallback(async () => {
    setGenerating(true);
    const result = await generateVariants(assetId);
    onVariantsGenerated(result);
    setGenerating(false);
  }, [assetId, generateVariants, onVariantsGenerated]);

  const handleAddCustomSize = useCallback(async () => {
    setGenerating(true);
    const result = await generateVariants(assetId);
    onVariantsGenerated(result);
    setGenerating(false);
  }, [assetId, generateVariants, onVariantsGenerated]);

  const srcSet = variants
    .filter((v) => v.type !== 'original' && v.type !== 'thumbnail')
    .map((v) => `${v.path} ${v.width}w`)
    .join(', ');

  const sizes = `(max-width: ${width}px) 100vw, ${width}px`;

  const pictureHtml = `<picture>
  <source srcset="${variants
    .filter((v) => v.type === 'webp')
    .map((v) => `${v.path} ${v.width}w`)
    .join(', ')}" type="image/webp" sizes="${sizes}" />
  <source srcset="${variants
    .filter((v) => v.type === 'avif')
    .map((v) => `${v.path} ${v.width}w`)
    .join(', ')}" type="image/avif" sizes="${sizes}" />
  <img
    src="${asset?.url ?? ''}"
    alt="${asset?.alt ?? asset?.filename ?? ''}"
    loading="lazy"
    decoding="async"
    width="${width}"
    height="${height}"
    srcset="${srcSet}"
    sizes="${sizes}"
  />
</picture>`;

  const handleCopy = (type: 'srcset' | 'sizes' | 'picture') => {
    let text = '';
    switch (type) {
      case 'srcset':
        text = srcSet;
        break;
      case 'sizes':
        text = sizes;
        break;
      case 'picture':
        text = pictureHtml;
        break;
    }
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-2">
          <h3 className="text-sm font-semibold">Responsive Images</h3>
        </div>

        <div className="space-y-4 p-4">
          <button
            onClick={handleGenerateVariants}
            disabled={generating}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {generating ? (
              <>
                <Settings2 className="size-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Image className="size-3" />
                Generate All Variants
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_SIZES.map((preset) => {
              const match = variants.find(
                (v) => v.type === preset.label.toLowerCase()
              );
              const fileSize = match?.size ?? 0;
              const variantHeight = match?.height ?? 0;
              return (
                <div
                  key={preset.label}
                  className={cn(
                    'rounded border p-2 text-xs',
                    match ? 'bg-card' : 'bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {preset.width}w
                    </span>
                  </div>
                  {match ? (
                    <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                      <p>
                        {match.width}&times;{variantHeight || '?'}
                      </p>
                      <p>{formatFileSize(fileSize)}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] italic text-muted-foreground">
                      Not generated
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-3">
            <h4 className="mb-2 text-xs font-medium">Custom Size</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground">
                  Width
                </label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="h-7 w-full rounded border px-2 text-xs outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground">
                  Max Height
                </label>
                <input
                  type="number"
                  value={customMaxHeight}
                  onChange={(e) => setCustomMaxHeight(Number(e.target.value))}
                  className="h-7 w-full rounded border px-2 text-xs outline-none"
                  placeholder="Auto"
                />
              </div>
              <button
                onClick={handleAddCustomSize}
                disabled={generating}
                className="mt-4 flex h-7 items-center justify-center rounded-md bg-primary px-2 text-primary-foreground disabled:opacity-50"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium">SrcSet</label>
                  <button
                    onClick={() => handleCopy('srcset')}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    {copied === 'srcset' ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied === 'srcset' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="max-h-12 overflow-y-auto rounded bg-muted p-2 text-[10px] leading-relaxed">
                  <code>{srcSet || 'No variants available'}</code>
                </pre>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium">Sizes</label>
                  <button
                    onClick={() => handleCopy('sizes')}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    {copied === 'sizes' ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied === 'sizes' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="rounded bg-muted p-2 text-[10px]">
                  <code>{sizes}</code>
                </pre>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs font-medium">
                    <Code className="size-3" />
                    &lt;picture&gt; Element
                  </label>
                  <button
                    onClick={() => handleCopy('picture')}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    {copied === 'picture' ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied === 'picture' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="max-h-32 overflow-y-auto rounded bg-muted p-2 text-[10px] leading-relaxed">
                  <code>{pictureHtml}</code>
                </pre>
              </div>

              <div className="border-t pt-3">
                <h4 className="mb-2 text-xs font-medium">Variant Previews</h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {variants
                    .filter((v) => v.type !== 'original')
                    .map((v) => (
                      <div
                        key={v.id}
                        className="overflow-hidden rounded border"
                      >
                        <div className="aspect-video bg-muted">
                          <img
                            src={v.path}
                            alt={v.type}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="px-2 py-1">
                          <p className="text-[10px] font-medium capitalize">
                            {v.type}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {v.width}&times;{v.height} &middot;{' '}
                            {formatFileSize(v.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
