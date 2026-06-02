'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Trash2,
  Check,
  Globe,
  Code2,
  Shield,
  Zap,
} from 'lucide-react';
import { useModuleInstaller } from '@/components/modules/useModuleInstaller';
import {
  ModulePreviewModal,
  type ModuleItem,
} from '@/components/modules/ModulePreviewModal';

export default function ModulesPage() {
  const [allModules, setAllModules] = useState<ModuleItem[]>([]);
  const [previewMod, setPreviewMod] = useState<ModuleItem | null>(null);
  const { installedIds, isInstalled, install, uninstall } =
    useModuleInstaller();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/modules');
        const data = await res.json();
        setAllModules(data);
      } catch {
        setAllModules([]);
      }
    })();
  }, []);

  const installedModules = useMemo(
    () => allModules.filter((m) => installedIds.includes(m.id)),
    [allModules, installedIds]
  );

  const iconMap: Record<string, typeof Globe> = {
    globe: Globe,
    code: Code2,
    shield: Shield,
    zap: Zap,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {installedModules.length} module
            {installedModules.length !== 1 ? 's' : ''} installed
          </p>
        </div>
        <Link
          href="/modules/marketplace"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Browse Marketplace
        </Link>
      </div>

      {installedModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Package className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No modules installed
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse the marketplace to find modules for your site.
          </p>
          <Link
            href="/modules/marketplace"
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {installedModules.map((mod) => {
            const Icon = iconMap[mod.icon ?? ''] ?? Package;
            return (
              <div
                key={mod.id}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 cursor-pointer"
                onClick={() => setPreviewMod({ ...mod, installed: true })}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <Check className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm">{mod.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>v{mod.version}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      uninstall(mod);
                    }}
                    className="flex items-center gap-1 rounded px-2 py-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                    Uninstall
                  </button>
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
          onInstall={install}
          onUninstall={(m) => {
            uninstall(m);
            setPreviewMod(null);
          }}
        />
      )}
    </div>
  );
}
