'use client';

import { useState, useCallback, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderUp,
  Image,
  Search,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function SettingsSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 py-1.5 text-xs font-medium text-muted-foreground"
      >
        {open ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        {title}
      </button>
      {open && <div className="space-y-2 pt-1">{children}</div>}
    </div>
  );
}

export function SettingsField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ResponsiveField({
  label,
  viewport,
  hasOverride,
  children,
}: {
  label: string;
  viewport: string;
  hasOverride: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hasOverride && <ViewportBadge viewport={viewport} />}
      </div>
      {children}
    </div>
  );
}

export function ViewportBadge({ viewport }: { viewport: string }) {
  return (
    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
      {viewport}
    </span>
  );
}

export function AssetPathInput({
  value,
  onChange,
  placeholder = 'Select an asset...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [search, setSearch] = useState('');
  const [media, setMedia] = useState<
    Array<{
      id: string;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
      width: number;
      height: number;
    }>
  >([
    {
      id: '1',
      url: '/placeholder.svg',
      filename: 'placeholder.svg',
      mimeType: 'image/svg+xml',
      size: 4200,
      width: 200,
      height: 60,
    },
  ]);

  const filtered = media.filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-1">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full text-xs font-mono"
        />
      </div>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setShowBrowser(!showBrowser)}
        >
          {value ? (
            <Image className="size-3.5" />
          ) : (
            <FolderUp className="size-3.5" />
          )}
        </Button>
        {showBrowser && (
          <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-card shadow-xl">
            <div className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange(item.url);
                      setShowBrowser(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md p-2 text-left text-xs hover:bg-accent"
                  >
                    <Image className="size-6 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.filename}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const url = window.prompt(
                    'Enter media URL:',
                    value || 'https://'
                  );
                  if (url) {
                    onChange(url);
                    setShowBrowser(false);
                  }
                }}
                className="w-full rounded-md border border-dashed py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                + Enter URL manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
