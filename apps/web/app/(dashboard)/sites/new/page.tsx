'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils/slugify';

interface Template {
  id: string;
  name: string;
  desc: string;
}

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('blank');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setTemplates(data.templates ?? []);
      } catch {
        setTemplates([
          { id: 'blank', name: 'Blank', desc: 'Start from scratch' },
          {
            id: 'landing',
            name: 'Landing Page',
            desc: 'Single-page marketing site',
          },
          {
            id: 'business',
            name: 'Business',
            desc: 'Multi-page business site',
          },
          { id: 'portfolio', name: 'Portfolio', desc: 'Showcase your work' },
          { id: 'blog', name: 'Blog', desc: 'Blog with articles' },
          { id: 'saas', name: 'SaaS', desc: 'Software product landing page' },
        ]);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subdomain: slugify(name),
          template,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? 'Failed to create site');
        return;
      }

      const site = await res.json();
      router.push(`/sites/${site.id}/pages`);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Site</h1>
        <p className="text-muted-foreground">Set up a new website project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Site Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="My Awesome Site"
          />
          {name && (
            <p className="mt-1 text-xs text-muted-foreground">
              URL: {slugify(name)}.sukit.app
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Template</label>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  template === t.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Site'}
        </button>
      </form>
    </div>
  );
}
