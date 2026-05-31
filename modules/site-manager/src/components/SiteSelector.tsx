'use client';

import { useState } from 'react';
import { ChevronDown, Globe, Plus, Settings, ExternalLink } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

interface SiteSelectorProps {
  onNavigate?: (path: string) => void;
}

export function SiteSelector({ onNavigate }: SiteSelectorProps) {
  const [open, setOpen] = useState(false);
  const sites = useSiteManagerStore((s) => s.sites);
  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const currentSite = useSiteManagerStore((s) => s.currentSite);
  const setCurrentSite = useSiteManagerStore((s) => s.setCurrentSite);

  const activeSites = sites.filter((s) => s.status === 'active');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
      >
        <Globe className="size-4 text-muted-foreground" />
        <span>{currentSite?.name ?? 'Select Site'}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border bg-card shadow-xl">
            <div className="border-b px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Sites
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              {activeSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    setCurrentSite(site.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors',
                    currentSiteId === site.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-accent'
                  )}
                >
                  <Globe className="size-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{site.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {site.slug} &middot; {site.language}
                    </p>
                  </div>
                  {currentSiteId === site.id && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}

              {activeSites.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No active sites
                </p>
              )}
            </div>

            <div className="border-t p-1">
              <button
                onClick={() => {
                  onNavigate?.('/sites/new');
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <Plus className="size-3.5" />
                New Site
              </button>
              {currentSiteId && (
                <button
                  onClick={() => {
                    onNavigate?.(`/sites/${currentSiteId}/settings`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
                >
                  <Settings className="size-3.5" />
                  Site Settings
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
