'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Code, FileCode, Image, Brackets } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { MediaAsset } from '../types';

interface EmbedPanelProps {
  asset: MediaAsset;
}

type EmbedFormat = 'html' | 'responsive' | 'wordpress' | 'markdown';

export function EmbedPanel({ asset }: EmbedPanelProps) {
  const copyUrl = useMediaStore((s) => s.copyUrl);
  const getUrl = useMediaStore((s) => s.getUrl);
  const getSrcSet = useMediaStore((s) => s.getSrcSet);

  const [copied, setCopied] = useState<EmbedFormat | null>(null);

  const handleCopy = useCallback(
    (format: EmbedFormat) => {
      let text = '';
      const url = copyUrl(asset.id, 'direct');
      const alt = asset.alt ?? asset.filename;

      switch (format) {
        case 'html':
          text = `<img src="${url}" alt="${alt}" />`;
          break;
        case 'responsive': {
          const srcset = getSrcSet(asset.id);
          if (srcset) {
            text = `<div style="max-width:100%">\n  <img\n    src="${url}"\n    srcset="${srcset}"\n    sizes="100vw"\n    style="width:100%;height:auto"\n    alt="${alt}"\n  />\n</div>`;
          } else {
            text = `<div style="max-width:100%">\n  <img style="width:100%;height:auto" src="${url}" alt="${alt}" />\n</div>`;
          }
          break;
        }
        case 'wordpress':
          text = `[caption id="attachment_${asset.id}" align="alignnone" width="${asset.width ?? ''}"]<img src="${url}" alt="${alt}" width="${asset.width ?? ''}" height="${asset.height ?? ''}" />${asset.caption ?? ''}[/caption]`;
          break;
        case 'markdown':
          text = copyUrl(asset.id, 'markdown');
          break;
      }

      (navigator as any).clipboard.writeText(text);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    },
    [asset, copyUrl, getUrl, getSrcSet]
  );

  const embedItems: {
    key: EmbedFormat;
    label: string;
    icon: typeof Code;
    description: string;
    preview: string;
  }[] = [
    {
      key: 'html',
      label: 'HTML',
      icon: Code,
      description: 'Standard <img> tag',
      preview: '<img src="url" alt="alt" />',
    },
    {
      key: 'responsive',
      label: 'Responsive',
      icon: FileCode,
      description: 'Responsive <div> with srcset',
      preview: '<div style="max-width:100%"><img ... /></div>',
    },
    {
      key: 'wordpress',
      label: 'WordPress',
      icon: Brackets,
      description: 'WordPress shortcode',
      preview: '[caption]...[img]...[/caption]',
    },
    {
      key: 'markdown',
      label: 'Markdown',
      icon: Image,
      description: 'Markdown image syntax',
      preview: '![alt](url)',
    },
  ];

  return (
    <div className="space-y-2">
      {embedItems.map((item) => (
        <button
          key={item.key}
          onClick={() => handleCopy(item.key)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-xs transition-colors hover:bg-accent',
            copied === item.key && 'border-green-500/50 bg-green-500/10'
          )}
        >
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded',
              copied === item.key ? 'bg-green-500/20' : 'bg-muted'
            )}
          >
            {copied === item.key ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <item.icon className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {item.description}
            </p>
            <code className="mt-0.5 block truncate text-[10px] text-muted-foreground/60">
              {item.preview}
            </code>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {copied === item.key ? 'Copied!' : 'Copy'}
          </span>
        </button>
      ))}
    </div>
  );
}
