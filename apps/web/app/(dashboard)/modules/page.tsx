'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ExternalLink,
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
import { cn } from '@/lib/utils/cn';

const ALL_MODULES: ModuleItem[] = [
  {
    id: 'visual-builder',
    name: 'Visual Builder',
    description: 'Drag-and-drop page builder',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 5400,
    rating: 4.8,
    price: 0,
    icon: 'code',
    category: 'builder',
    longDescription: 'Build beautiful pages without code.',
    features: ['35+ block types', 'Responsive design', 'Drag-and-drop canvas'],
  },
  {
    id: 'site-manager',
    name: 'Site Manager',
    description: 'Multi-site management and team collaboration',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 3200,
    rating: 4.6,
    price: 0,
    icon: 'globe',
    category: 'management',
    longDescription: 'Manage multiple sites from one dashboard.',
    features: ['Unlimited sites', 'Page tree', 'Team roles'],
  },
  {
    id: 'media-library',
    name: 'Media Library',
    description: 'Upload, optimize, and manage images',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 2800,
    rating: 4.7,
    price: 0,
    icon: 'shield',
    category: 'media',
    longDescription: 'Complete media management solution.',
    features: ['Drag-drop upload', 'WebP/AVIF conversion', 'Image editing'],
  },
  {
    id: 'seo',
    name: 'SEO Optimizer',
    description: 'Meta tags, sitemaps, and SEO analysis',
    author: 'SUKIT',
    version: '1.2.0',
    downloads: 1200,
    rating: 4.5,
    price: 0,
    icon: 'shield',
    category: 'seo',
  },
  {
    id: 'popup-builder',
    name: 'Popup Builder',
    description: 'Create popups and notification bars',
    author: 'SUKIT',
    version: '1.0.0',
    downloads: 890,
    rating: 4.3,
    price: 0,
    icon: 'zap',
    category: 'marketing',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Visitor analytics with charts',
    author: 'SUKIT',
    version: '1.0.0',
    downloads: 780,
    rating: 4.8,
    price: 0,
    icon: 'zap',
    category: 'analytics',
  },
];

export default function ModulesPage() {
  const [previewMod, setPreviewMod] = useState<ModuleItem | null>(null);
  const { installedIds, isInstalled, install, uninstall } =
    useModuleInstaller();

  const installedModules = useMemo(
    () => ALL_MODULES.filter((m) => installedIds.includes(m.id)),
    [installedIds]
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
