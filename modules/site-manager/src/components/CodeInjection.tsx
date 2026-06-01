'use client';

import { useState } from 'react';
import { Code, Save } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

interface CodeInjectionProps {
  siteId: string;
  initialHead?: string;
  initialBody?: string;
  className?: string;
}

export function CodeInjection({
  siteId,
  initialHead = '',
  initialBody = '',
  className,
}: CodeInjectionProps) {
  const updateSite = useSiteManagerStore((s) => s.updateSite);
  const [headHtml, setHeadHtml] = useState(initialHead);
  const [bodyHtml, setBodyHtml] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateSite(siteId, {
      settings: {
        codeInjection: { head: headHtml, body: bodyHtml, css: '', js: '' },
      },
    } as any);
    setSaving(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Code Injection</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Save className="size-3" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Head HTML
        </label>
        <textarea
          value={headHtml}
          onChange={(e) => setHeadHtml(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border bg-card px-3 py-2 font-mono text-xs"
          placeholder="<meta>, <link>, <style> tags..."
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Body HTML
        </label>
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border bg-card px-3 py-2 font-mono text-xs"
          placeholder="<script>, tracking codes..."
        />
      </div>
    </div>
  );
}
