'use client';

import { useState, useMemo } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Search, X } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

export function TrashView() {
  const sites = useSiteManagerStore((s) => s.sites);
  const restoreSite = useSiteManagerStore((s) => s.restoreSite);
  const deleteSite = useSiteManagerStore((s) => s.deleteSite);
  const pages = useSiteManagerStore((s) => s.pages);
  const restorePage = useSiteManagerStore((s) => s.restorePage);
  const deletePage = useSiteManagerStore((s) => s.deletePage);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'sites' | 'pages'>('sites');
  const [confirmPermanent, setConfirmPermanent] = useState<{
    type: 'site' | 'page';
    id: string;
  } | null>(null);

  const trashedSites = useMemo(
    () => sites.filter((s) => s.status === 'trashed'),
    [sites]
  );
  const trashedPages = useMemo(
    () => pages.filter((p) => p.status === 'trashed'),
    [pages]
  );

  const filteredSites = useMemo(
    () =>
      trashedSites.filter(
        (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [trashedSites, search]
  );
  const filteredPages = useMemo(
    () =>
      trashedPages.filter(
        (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
      ),
    [trashedPages, search]
  );

  const handlePermanentDelete = () => {
    if (!confirmPermanent) return;
    if (confirmPermanent.type === 'site') {
      deleteSite(confirmPermanent.id, true);
    } else {
      deletePage(confirmPermanent.id, true);
    }
    setConfirmPermanent(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Trash2 className="size-4 text-destructive" />
          Trash
          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
            {trashedSites.length + trashedPages.length}
          </span>
        </h3>
      </div>

      <div className="flex gap-1 border-b px-4 py-2">
        {(['sites', 'pages'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              tab === t
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} (
            {t === 'sites' ? trashedSites.length : trashedPages.length})
          </button>
        ))}
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trash..."
            className="h-7 w-full rounded-md border bg-background pl-8 pr-3 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'sites' && (
          <>
            {filteredSites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trash2 className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No trashed sites
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredSites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{site.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Deleted{' '}
                        {site.updatedAt
                          ? new Date(site.updatedAt).toLocaleDateString()
                          : 'recently'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => restoreSite(site.id)}
                        className="rounded p-1.5 text-muted-foreground hover:text-green-500"
                        title="Restore"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmPermanent({ type: 'site', id: site.id })
                        }
                        className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                        title="Delete permanently"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'pages' && (
          <>
            {filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trash2 className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No trashed pages
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{page.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        /{page.slug} &middot; Deleted{' '}
                        {page.updatedAt
                          ? new Date(page.updatedAt).toLocaleDateString()
                          : 'recently'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => restorePage(page.id)}
                        className="rounded p-1.5 text-muted-foreground hover:text-green-500"
                        title="Restore"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmPermanent({ type: 'page', id: page.id })
                        }
                        className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                        title="Delete permanently"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {confirmPermanent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-80 rounded-lg border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-destructive">
              <AlertTriangle className="size-5" />
              <h3 className="text-sm font-medium">Permanently Delete?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              This action cannot be undone. The {confirmPermanent.type} and all
              its data will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePermanentDelete}
                className="flex-1 rounded-md bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground"
              >
                Delete Forever
              </button>
              <button
                onClick={() => setConfirmPermanent(null)}
                className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
