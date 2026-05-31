'use client';

import { useState, useEffect } from 'react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import type { PageStatus, PageSEO } from '../types';

const STATUS_OPTIONS: { value: PageStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
];

export function PageSettings() {
  const currentPage = useSiteManagerStore((s) => s.currentPage);
  const updatePage = useSiteManagerStore((s) => s.updatePage);

  if (!currentPage) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-xs text-muted-foreground text-center">
          Select a page to view settings
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: unknown) => {
    updatePage(currentPage.id, { [field]: value });
  };

  const handleSEOChange = (field: keyof PageSEO, value: string) => {
    updatePage(currentPage.id, {
      seo: { ...currentPage.seo, [field]: value },
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Page Settings
        </h3>
        <p className="text-[10px] text-muted-foreground">/{currentPage.slug}</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Title</label>
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Slug</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">/</span>
            <input
              type="text"
              value={currentPage.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="h-8 flex-1 rounded-md border bg-background px-3 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={currentPage.status}
            onChange={(e) =>
              handleChange('status', e.target.value as PageStatus)
            }
            className="h-8 w-full rounded-md border bg-background px-3 text-xs"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Template</label>
          <select
            value={currentPage.template}
            onChange={(e) => handleChange('template', e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-3 text-xs"
          >
            {['default', 'landing', 'blog', 'coming-soon'].map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Show in Nav</label>
          <input
            type="checkbox"
            checked={currentPage.showInNav}
            onChange={(e) => handleChange('showInNav', e.target.checked)}
            className="rounded"
          />
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t pt-4">
        <h4 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          SEO
        </h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Meta Title</label>
            <input
              type="text"
              value={currentPage.seo?.metaTitle ?? ''}
              onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
              className="h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Meta Description
            </label>
            <textarea
              value={currentPage.seo?.metaDescription ?? ''}
              onChange={(e) =>
                handleSEOChange('metaDescription', e.target.value)
              }
              className="h-16 w-full rounded-md border bg-background p-2 text-xs"
              maxLength={160}
            />
            <p className="text-[10px] text-muted-foreground">
              {(currentPage.seo?.metaDescription ?? '').length}/160
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">OG Image</label>
            <input
              type="text"
              value={currentPage.seo?.ogImage ?? ''}
              onChange={(e) => handleSEOChange('ogImage', e.target.value)}
              className="h-8 w-full rounded-md border bg-background px-3 text-xs font-mono"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
