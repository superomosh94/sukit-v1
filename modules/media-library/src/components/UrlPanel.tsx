'use client';

import { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Link,
  Image,
  Code,
  FileCode,
  Globe,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { MediaAsset, VariantType } from '../types';

interface UrlPanelProps {
  asset: MediaAsset;
}

type CopyFormat =
  | 'direct'
  | 'markdown'
  | 'html'
  | 'picture'
  | 'thumbnail'
  | 'srcset'
  | 'short';

export function UrlPanel({ asset }: UrlPanelProps) {
  const getUrl = useMediaStore((s) => s.getUrl);
  const getSrcSet = useMediaStore((s) => s.getSrcSet);
  const copyUrl = useMediaStore((s) => s.copyUrl);

  const [copied, setCopied] = useState<CopyFormat | null>(null);
  const [expirationMinutes, setExpirationMinutes] = useState(60);
  const [signedUrl, setSignedUrl] = useState('');

  const handleCopy = useCallback(
    (format: CopyFormat) => {
      let text = '';
      switch (format) {
        case 'direct':
          text = copyUrl(asset.id, 'direct');
          break;
        case 'markdown':
          text = copyUrl(asset.id, 'markdown');
          break;
        case 'html':
          text = copyUrl(asset.id, 'html');
          break;
        case 'picture': {
          const url = getUrl(asset.id, 'original');
          const srcset = getSrcSet(asset.id);
          if (srcset) {
            text = `<picture>\n  <source srcset="${srcset}" />\n  <img src="${url}" alt="${asset.alt ?? ''}" />\n</picture>`;
          } else {
            text = `<img src="${url}" alt="${asset.alt ?? ''}" />`;
          }
          break;
        }
        case 'thumbnail':
          text = getUrl(asset.id, 'thumbnail');
          break;
        case 'srcset':
          text = getSrcSet(asset.id);
          break;
        case 'short':
          text = copyUrl(asset.id, 'direct');
          break;
      }
      (navigator as any).clipboard.writeText(text);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    },
    [asset, copyUrl, getUrl, getSrcSet]
  );

  const handleSignedUrl = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/media/${asset.id}/signed-url?expires=${expirationMinutes}`,
        {
          method: 'POST',
        }
      );
      const data = await res.json();
      setSignedUrl(data.url ?? '');
      await (navigator as any).clipboard.writeText(data.url ?? '');
      setCopied('direct');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }, [asset.id, expirationMinutes]);

  const copyItems: {
    key: CopyFormat;
    label: string;
    icon: typeof Copy;
    description: string;
  }[] = [
    {
      key: 'direct',
      label: 'Direct URL',
      icon: Link,
      description: 'Copy direct file URL',
    },
    {
      key: 'markdown',
      label: 'Markdown',
      icon: Image,
      description: '![alt](url)',
    },
    {
      key: 'html',
      label: 'HTML <img>',
      icon: Code,
      description: '<img src="url" />',
    },
    {
      key: 'picture',
      label: 'HTML <picture>',
      icon: FileCode,
      description: '<picture> with srcset',
    },
    {
      key: 'thumbnail',
      label: 'Thumbnail URL',
      icon: Image,
      description: 'Copy thumbnail URL',
    },
    {
      key: 'srcset',
      label: 'Srcset',
      icon: Image,
      description: 'Responsive srcset',
    },
  ];

  const directUrl = getUrl(asset.id, 'original');

  return (
    <div className="space-y-4">
      {/* Copy buttons */}
      <div className="grid grid-cols-2 gap-2">
        {copyItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleCopy(item.key)}
            className={cn(
              'flex items-center gap-2 rounded border px-3 py-2 text-xs transition-colors hover:bg-accent',
              copied === item.key && 'border-green-500/50 bg-green-500/10'
            )}
          >
            {copied === item.key ? (
              <Check className="size-3.5 shrink-0 text-green-500" />
            ) : (
              <item.icon className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 text-left">
              <p className="font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.description}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {copied === item.key ? 'Copied!' : 'Copy'}
            </span>
          </button>
        ))}
      </div>

      {/* Signed URL */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase text-muted-foreground">
          Signed URL
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={1440}
            value={expirationMinutes}
            onChange={(e) => setExpirationMinutes(Number(e.target.value))}
            className="w-16 rounded border px-2 py-1 text-xs outline-none"
          />
          <span className="self-center text-[10px] text-muted-foreground">
            min
          </span>
          <button
            onClick={handleSignedUrl}
            className="rounded bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground"
          >
            Generate & Copy
          </button>
        </div>
        {signedUrl && (
          <p className="truncate rounded bg-muted px-2 py-1 text-[10px] font-mono text-muted-foreground">
            {signedUrl}
          </p>
        )}
      </div>

      {/* CDN URL */}
      {process.env.NEXT_PUBLIC_CDN_URL && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase text-muted-foreground">
            CDN URL
          </label>
          <div className="flex items-center gap-2 rounded border px-2 py-1">
            <Globe className="size-3 text-muted-foreground" />
            <p className="flex-1 truncate text-[10px] font-mono">
              {`${process.env.NEXT_PUBLIC_CDN_URL}/media/${asset.id}/${asset.filename}`}
            </p>
            <button
              onClick={() => {
                (navigator as any).clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_CDN_URL}/media/${asset.id}/${asset.filename}`
                );
                setCopied('direct');
                setTimeout(() => setCopied(null), 2000);
              }}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              {copied === 'direct' ? (
                <Check className="size-3 text-green-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Open in new tab */}
      {directUrl && (
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          <ExternalLink className="size-3.5" />
          Open in new tab
        </a>
      )}
    </div>
  );
}
