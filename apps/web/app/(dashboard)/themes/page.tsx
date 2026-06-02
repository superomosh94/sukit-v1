'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeCard } from '@/components/themes/ThemeCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  active: boolean;
  config: Record<string, unknown>;
}

interface AvailableTheme {
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  palette: Record<string, string>;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [availableThemes, setAvailableThemes] = useState<AvailableTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);

  const installAllThemes = async () => {
    setInstalling(true);
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install-all' }),
      });
      if (!res.ok) throw new Error('Failed to install themes');
      const data = await res.json();
      setThemes(data.themes || []);
      setActiveSlug(data.active?.slug || null);
      if (data.created?.length > 0) {
        toast.success(
          `Installed ${data.created.length} theme${data.created.length > 1 ? 's' : ''}`
        );
      }
    } catch {
      toast.error('Failed to install themes');
    } finally {
      setInstalling(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/themes');
        if (!res.ok) throw new Error('Failed to fetch themes');
        const data = await res.json();
        setThemes(data.themes || []);
        setActiveSlug(data.active?.slug || null);
        setAvailableThemes(data.available || []);
        if (
          (!data.themes || data.themes.length === 0) &&
          data.available?.length > 0
        ) {
          installAllThemes();
        }
      } catch {
        toast.error('Failed to load themes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      if (!res.ok) throw new Error('Failed to fetch themes');
      const data = await res.json();
      setThemes(data.themes || []);
      setActiveSlug(data.active?.slug || null);
      setAvailableThemes(data.available || []);
    } catch {
      toast.error('Failed to refresh themes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleActivate = (slug: string) => {
    setThemes((prev) => prev.map((t) => ({ ...t, active: t.slug === slug })));
    setActiveSlug(slug);
  };

  const handleInstallSingle = async (avail: AvailableTheme) => {
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install-all' }),
      });
      if (!res.ok) throw new Error('Failed to install theme');
      const data = await res.json();
      setThemes(data.themes || []);
      setActiveSlug(data.active?.slug || null);
      toast.success(`"${avail.name}" installed`);
    } catch {
      toast.error(`Failed to install "${avail.name}"`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Themes</h1>
            <p className="text-sm text-muted-foreground">
              Manage site themes and appearance
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-6 animate-pulse"
            >
              <div className="h-40 rounded-lg bg-muted mb-3" />
              <div className="h-5 w-2/3 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const notInstalled = availableThemes.filter(
    (a) => !themes.some((t) => t.slug === a.slug)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Themes</h1>
          <p className="text-sm text-muted-foreground">
            Manage site themes and appearance
          </p>
        </div>
        <div className="flex gap-2">
          {themes.length < availableThemes.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={installAllThemes}
              disabled={installing}
            >
              <Download className="size-4 mr-1.5" />
              {installing
                ? 'Installing...'
                : `Install All (${notInstalled.length})`}
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Install Theme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Install Theme</DialogTitle>
                <DialogDescription>
                  Choose from available themes to install.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notInstalled.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    All available themes are installed.
                  </p>
                ) : (
                  notInstalled.map((avail) => (
                    <div
                      key={avail.slug}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 rounded-full border shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${Object.values(avail.palette).slice(0, 3).join(', ')})`,
                            }}
                          />
                          <p className="text-sm font-medium truncate">
                            {avail.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {avail.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInstallSingle(avail)}
                      >
                        Install
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchThemes}
            disabled={loading}
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Download className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No themes installed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Install themes to customize your site appearance.
          </p>
          <Button onClick={installAllThemes} disabled={installing}>
            <Download className="size-4 mr-1.5" />
            {installing ? 'Installing...' : 'Install Default Themes'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => {
            const avail = availableThemes.find((a) => a.slug === theme.slug);
            const palette =
              avail?.palette || getPaletteFromConfig(theme.config);
            return (
              <ThemeCard
                key={theme.id}
                id={theme.id}
                name={theme.name}
                slug={theme.slug}
                description={theme.description}
                author={theme.author}
                isActive={theme.slug === activeSlug}
                palette={palette}
                onActivate={handleActivate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function getPaletteFromConfig(
  config: Record<string, unknown>
): Record<string, string> {
  try {
    const settings = (
      config as {
        settings?: { color?: { palette?: { slug: string; color: string }[] } };
      }
    )?.settings;
    if (settings?.color?.palette) {
      return Object.fromEntries(
        settings.color.palette.map((c) => [c.slug, c.color])
      );
    }
  } catch {}
  return {
    white: '#ffffff',
    'slate-900': '#0f172a',
    'blue-500': '#3b82f6',
  };
}
