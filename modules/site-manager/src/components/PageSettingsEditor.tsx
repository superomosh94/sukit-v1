import React, { useState, useCallback } from 'react';
import {
  Link,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText,
  Image,
  Tags,
} from 'lucide-react';

export interface PageSettings {
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate?: string;
  authorId?: string;
  featuredImage?: string;
  excerpt?: string;
  pageTemplate?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PageSettingsEditorProps {
  settings: PageSettings;
  onChange: (settings: PageSettings) => void;
  authors?: Array<{ id: string; name: string }>;
  templates?: string[];
}

export function PageSettingsEditor({
  settings,
  onChange,
  authors = [],
  templates = [],
}: PageSettingsEditorProps) {
  const update = (key: keyof PageSettings, value: any) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          General
        </h4>
        <div>
          <label className="text-xs text-muted-foreground">Page Template</label>
          <select
            value={settings.pageTemplate || ''}
            onChange={(e) => update('pageTemplate', e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
          >
            <option value="">Default</option>
            {templates.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Author</label>
          <select
            value={settings.authorId || ''}
            onChange={(e) => update('authorId', e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
          >
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Publishing
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={settings.status}
            onChange={(e) => update('status', e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        {settings.status === 'scheduled' && (
          <div>
            <label className="text-xs text-muted-foreground">
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={settings.publishDate || ''}
              onChange={(e) => update('publishDate', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Visibility
        </h4>
        <div className="space-y-2">
          {[
            { value: 'public', label: 'Public', icon: Globe },
            { value: 'private', label: 'Private', icon: Lock },
            { value: 'password', label: 'Password Protected', icon: EyeOff },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${settings.visibility === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={settings.visibility === option.value}
                  onChange={(e) => update('visibility', e.target.value)}
                  className="text-primary"
                />
                <Icon size={16} />
                <span className="text-sm">{option.label}</span>
              </label>
            );
          })}
        </div>
        {settings.visibility === 'password' && (
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={settings.password || ''}
              onChange={(e) => update('password', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
              placeholder="Enter page password"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          SEO Preview
        </h4>
        <div>
          <label className="text-xs text-muted-foreground">SEO Title</label>
          <input
            type="text"
            value={settings.seoTitle || ''}
            onChange={(e) => update('seoTitle', e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">
            Meta Description
          </label>
          <textarea
            value={settings.seoDescription || ''}
            onChange={(e) => update('seoDescription', e.target.value)}
            rows={3}
            className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">
            Featured Image
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={settings.featuredImage || ''}
              onChange={(e) => update('featuredImage', e.target.value)}
              placeholder="Image URL"
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
            />
            <button className="p-2 rounded-md bg-muted hover:bg-accent">
              <Image size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Excerpt</label>
          <textarea
            value={settings.excerpt || ''}
            onChange={(e) => update('excerpt', e.target.value)}
            rows={2}
            className="w-full mt-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
            placeholder="Page excerpt for listings..."
          />
        </div>
      </div>
    </div>
  );
}
