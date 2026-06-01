'use client';

import { useMemo } from 'react';
import { useSeoStore } from '../stores/seoStore';
import { cn } from '../utils/cn';

interface MetaEditorProps {
  className?: string;
}

export function MetaEditor({ className }: MetaEditorProps) {
  const meta = useSeoStore((s) => s.meta);
  const setMeta = useSeoStore((s) => s.setMeta);

  const titleLength = meta.title.length;
  const descriptionLength = meta.description.length;
  const titleStatus =
    titleLength >= 30 && titleLength <= 60
      ? 'good'
      : titleLength > 60
        ? 'long'
        : 'short';
  const descStatus =
    descriptionLength >= 120 && descriptionLength <= 160
      ? 'good'
      : descriptionLength > 160
        ? 'long'
        : 'short';

  return (
    <div className={cn('space-y-6 rounded-lg border bg-card p-4', className)}>
      <h3 className="text-sm font-medium">Meta Tags Editor</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Meta Title ({titleLength}/60)
            </label>
            <div
              className={cn(
                'mt-1 h-0.5 rounded-full',
                titleStatus === 'good'
                  ? 'bg-green-500'
                  : titleStatus === 'long'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
              )}
              style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
            />
            <input
              type="text"
              value={meta.title}
              onChange={(e) => setMeta({ title: e.target.value })}
              placeholder="Enter meta title..."
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Meta Description ({descriptionLength}/160)
            </label>
            <div
              className={cn(
                'mt-1 h-0.5 rounded-full',
                descStatus === 'good'
                  ? 'bg-green-500'
                  : descStatus === 'long'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
              )}
              style={{
                width: `${Math.min(100, (descriptionLength / 160) * 100)}%`,
              }}
            />
            <textarea
              value={meta.description}
              onChange={(e) => setMeta({ description: e.target.value })}
              rows={3}
              placeholder="Enter meta description..."
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Keywords
            </label>
            <input
              type="text"
              value={meta.keywords}
              onChange={(e) => setMeta({ keywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Canonical URL
            </label>
            <input
              type="url"
              value={meta.canonical}
              onChange={(e) => setMeta({ canonical: e.target.value })}
              placeholder="https://example.com/page"
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Robots
            </label>
            <select
              value={meta.robots}
              onChange={(e) => setMeta({ robots: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="index, follow">Index, Follow</option>
              <option value="noindex, follow">No Index, Follow</option>
              <option value="index, nofollow">Index, No Follow</option>
              <option value="noindex, nofollow">No Index, No Follow</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Open Graph Title
            </label>
            <input
              type="text"
              value={meta.ogTitle}
              onChange={(e) => setMeta({ ogTitle: e.target.value })}
              placeholder="OG Title (defaults to meta title)"
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Open Graph Description
            </label>
            <textarea
              value={meta.ogDescription}
              onChange={(e) => setMeta({ ogDescription: e.target.value })}
              rows={2}
              placeholder="OG Description"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              OG Image URL
            </label>
            <input
              type="url"
              value={meta.ogImage}
              onChange={(e) => setMeta({ ogImage: e.target.value })}
              placeholder="https://example.com/og-image.jpg"
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Twitter Card
            </label>
            <select
              value={meta.twitterCard}
              onChange={(e) => setMeta({ twitterCard: e.target.value as any })}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="summary">Summary Card</option>
              <option value="summary_large_image">Summary Large Image</option>
            </select>
          </div>

          <div className="rounded-lg border bg-muted p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Google Preview
            </h4>
            <div className="space-y-0.5">
              <p className="text-sm text-blue-600 underline truncate">
                {meta.title || 'Page Title'} - Site Name
              </p>
              <p className="text-xs text-green-700 truncate">
                https://example.com/page
              </p>
              <p className="text-xs text-gray-600 line-clamp-2">
                {meta.description || 'Meta description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
