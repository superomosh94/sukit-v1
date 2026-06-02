'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Package, Trash2, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useModuleInstaller } from '@/components/modules/useModuleInstaller';
import {
  ModulePreviewModal,
  type ModuleItem,
} from '@/components/modules/ModulePreviewModal';

export default function PluginsPage() {
  const [allPlugins, setAllPlugins] = useState<ModuleItem[]>([]);
  const [tab, setTab] = useState<'installed' | 'available'>('installed');
  const [previewMod, setPreviewMod] = useState<ModuleItem | null>(null);
  const { installedIds, isInstalled, install, uninstall } =
    useModuleInstaller();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/plugins');
        const data = await res.json();
        setAllPlugins(data);
      } catch {
        setAllPlugins([]);
      }
    })();
  }, []);

  const installedPlugins = useMemo(
    () => allPlugins.filter((p) => installedIds.includes(p.id)),
    [allPlugins, installedIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {installedPlugins.length} plugin
            {installedPlugins.length !== 1 ? 's' : ''} installed
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/plugins/add"
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Add Plugin
          </Link>
          <Link
            href="/plugins/create"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create Plugin
          </Link>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(['installed', 'available'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'installed' && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px]">
                {installedPlugins.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'installed' ? (
        installedPlugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
            <Package className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No plugins installed
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Switch to the Available tab to browse and install plugins.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {installedPlugins.map((plugin) => (
              <div key={plugin.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{plugin.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plugin.description}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
                    <Check className="size-3" />
                    Active
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    by {plugin.author} · v{plugin.version}
                  </span>
                  <button
                    onClick={() => uninstall(plugin)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                    Uninstall
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allPlugins.map((plugin) => {
            const installed = isInstalled(plugin.id);
            return (
              <div
                key={plugin.id}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 cursor-pointer"
                onClick={() => setPreviewMod({ ...plugin, installed })}
              >
                <h3 className="font-semibold text-sm">{plugin.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {plugin.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {plugin.author}</span>
                  <span className="flex items-center gap-1">
                    <Download className="size-3" />
                    {plugin.downloads}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
                  </span>
                  {installed ? (
                    <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-[10px] font-medium text-green-600">
                      <Check className="size-3" />
                      Installed
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        install(plugin);
                      }}
                      className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewMod && (
        <ModulePreviewModal
          module={previewMod}
          open={!!previewMod}
          onClose={() => setPreviewMod(null)}
          onInstall={(m) => {
            install(m);
            setPreviewMod({ ...m, installed: true });
          }}
          onUninstall={(m) => {
            uninstall(m);
            setPreviewMod(null);
          }}
        />
      )}
    </div>
  );
}
