'use client';

import { useState } from 'react';
import { Globe, X, Loader2 } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';

const TEMPLATES = [
  { id: 'blank', name: 'Blank Site', description: 'Start from scratch' },
  { id: 'blog', name: 'Blog', description: 'Blog with posts and categories' },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work' },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Single page marketing site',
  },
];

interface CreateSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSiteDialog({
  open,
  onOpenChange,
}: CreateSiteDialogProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const createSite = useSiteManagerStore((s) => s.createSite);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    const site = await createSite({
      name: name.trim(),
      description: description.trim(),
      template: selectedTemplate,
    });
    if (site) {
      onOpenChange(false);
      setName('');
      setDescription('');
      setSlug('');
      setStep('template');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[480px] rounded-lg border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Create New Site</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {step === 'template' ? (
          <div className="p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Choose a starting template for your new site
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    setStep('details');
                  }}
                  className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">
                Site Name *
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug)
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="mt-1 h-9 w-full rounded-md border px-3 text-sm"
                placeholder="My Awesome Site"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Slug</label>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">/sites/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-9 flex-1 rounded-md border px-3 text-sm font-mono"
                  placeholder="my-awesome-site"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-20 w-full rounded-md border bg-background p-3 text-sm"
                placeholder="A brief description of your site..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Create Site
              </button>
              <button
                onClick={() => setStep('template')}
                className="flex-1 rounded-md border px-4 py-2 text-sm font-medium"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
