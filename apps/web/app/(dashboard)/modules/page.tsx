'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Puzzle,
  Store,
  Blocks,
  Check,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Settings2,
  Globe,
  Code2,
  Shield,
  Zap,
  Image,
  FormInput,
  MessageSquare,
  ShoppingCart,
  Smartphone,
} from 'lucide-react';

const BUILTIN_BLOCKS = [
  { type: 'heading', name: 'Heading', category: 'content', source: 'core', description: 'Section headings H1-H6' },
  { type: 'text', name: 'Text', category: 'content', source: 'core', description: 'Rich text paragraph' },
  { type: 'image', name: 'Image', category: 'media', source: 'media', description: 'Single image with alt text' },
  { type: 'gallery', name: 'Gallery', category: 'media', source: 'media', description: 'Image grid gallery' },
  { type: 'carousel', name: 'Carousel', category: 'media', source: 'media', description: 'Sliding image carousel' },
  { type: 'video', name: 'Video', category: 'media', source: 'core', description: 'Embedded video player' },
  { type: 'button', name: 'Button', category: 'content', source: 'core', description: 'Call to action button' },
  { type: 'divider', name: 'Divider', category: 'layout', source: 'core', description: 'Horizontal rule' },
  { type: 'spacer', name: 'Spacer', category: 'layout', source: 'core', description: 'Vertical spacing' },
  { type: 'columns', name: 'Columns', category: 'layout', source: 'core', description: 'Multi-column layout' },
  { type: 'container', name: 'Container', category: 'layout', source: 'core', description: 'Content wrapper' },
  { type: 'form', name: 'Form', category: 'forms', source: 'forms', description: 'Contact / subscription form' },
  { type: 'map', name: 'Map', category: 'content', source: 'core', description: 'Embedded map' },
  { type: 'icon', name: 'Icon', category: 'content', source: 'core', description: 'SVG icon picker' },
  { type: 'avatar', name: 'Avatar', category: 'media', source: 'core', description: 'User avatar' },
  { type: 'card', name: 'Card', category: 'layout', source: 'core', description: 'Content card' },
  { type: 'testimonial', name: 'Testimonial', category: 'widgets', source: 'testimonials', description: 'Review card' },
  { type: 'pricing', name: 'Pricing Table', category: 'widgets', source: 'pricing', description: 'Pricing plan card' },
  { type: 'faq', name: 'FAQ', category: 'widgets', source: 'faq', description: 'Expandable FAQ item' },
  { type: 'accordion', name: 'Accordion', category: 'widgets', source: 'core', description: 'Collapsible sections' },
  { type: 'tabs', name: 'Tabs', category: 'widgets', source: 'core', description: 'Tabbed content' },
  { type: 'countdown', name: 'Countdown', category: 'widgets', source: 'countdown', description: 'Timer countdown' },
  { type: 'social-feed', name: 'Social Feed', category: 'widgets', source: 'social', description: 'Social media embed' },
  { type: 'mpesa', name: 'M-Pesa Pay', category: 'widgets', source: 'mpesa', description: 'M-Pesa payment button' },
];

const iconMap: Record<string, typeof Globe> = {
  globe: Globe, code: Code2, shield: Shield, zap: Zap,
  image: Image, form: FormInput, message: MessageSquare,
  cart: ShoppingCart, phone: Smartphone,
};

const categoryColors: Record<string, string> = {
  content: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  media: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  layout: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  forms: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  widgets: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface ModuleItem {
  id: string; name: string; description: string;
  author: string; version: string; icon: string;
  category: string; tags: string[]; price: number;
  downloads: number; rating: number;
}

interface InstalledModule extends ModuleItem {
  enabled: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
}

const DEMO_INSTALLED: InstalledModule[] = [
  { id: 'media', name: 'Media Library', description: 'Upload, optimize, and manage images', author: 'Sukit', version: '2.1.0', icon: 'image', category: 'media', tags: ['media'], price: 0, downloads: 1200, rating: 4.5, enabled: true },
  { id: 'forms', name: 'Form Builder', description: 'Drag-drop form builder with conditional logic', author: 'Sukit', version: '1.2.0', icon: 'form', category: 'forms', tags: ['forms'], price: 0, downloads: 800, rating: 4.2, enabled: true, hasUpdate: true, latestVersion: '1.3.0' },
  { id: 'mpesa', name: 'M-Pesa Payments', description: 'Accept M-Pesa payments via Daraja API', author: 'Sukit', version: '1.0.0', icon: 'phone', category: 'widgets', tags: ['payments'], price: 0, downloads: 340, rating: 4.7, enabled: true },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer review and testimonial management', author: 'Sukit', version: '1.0.0', icon: 'message', category: 'widgets', tags: ['reviews'], price: 0, downloads: 210, rating: 4.0, enabled: true },
];

export default function ModuleManagerPage() {
  const [modules, setModules] = useState<InstalledModule[]>(DEMO_INSTALLED);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const toggleEnabled = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const totalBlocks = BUILTIN_BLOCKS.length;
  const moduleBlocks = BUILTIN_BLOCKS.filter(b => b.source !== 'core');
  const coreBlocks = BUILTIN_BLOCKS.filter(b => b.source === 'core');

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Module Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage modules, blocks, and marketplace
          </p>
        </div>
        <Link
          href="/modules/marketplace"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Store className="size-4" />
          Browse Marketplace
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="module-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <Puzzle className="size-5" />
            </div>
            <div>
              <div className="module-stat-value text-foreground">{modules.length}</div>
              <div className="module-stat-label">Installed Modules</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {modules.map(m => (
              <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {m.enabled && <span className="size-1.5 rounded-full bg-green-500" />}
                {m.name}
              </span>
            ))}
          </div>
        </div>
        <div className="module-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Blocks className="size-5" />
            </div>
            <div>
              <div className="module-stat-value text-foreground">{totalBlocks}</div>
              <div className="module-stat-label">Available Blocks</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(
              BUILTIN_BLOCKS.reduce((acc, b) => {
                acc[b.category] = (acc[b.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([cat, count]) => (
              <span key={cat} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[cat] || ''}`}>
                {cat} ({count})
              </span>
            ))}
          </div>
        </div>
        <div className="module-stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Store className="size-5" />
            </div>
            <div>
              <div className="module-stat-value text-foreground">127</div>
              <div className="module-stat-label">Marketplace</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Free: 89</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Premium: 38</span>
          </div>
        </div>
      </div>

      {/* ── Installed Modules ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Installed Modules</h2>
          <Link href="/modules/marketplace" className="text-sm text-primary hover:underline">
            Discover more
          </Link>
        </div>
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
            <Package className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No modules installed</p>
            <Link href="/modules/marketplace" className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              const Icon = iconMap[mod.icon] ?? Package;
              return (
                <Link
                  key={mod.id}
                  href={`/modules/${mod.id}`}
                  className="module-card group"
                >
                  <div className="flex items-start gap-3">
                    <div className="module-card-icon">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{mod.name}</h3>
                        {mod.hasUpdate && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mod.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`module-status-dot ${mod.enabled ? 'module-status-dot--active' : 'module-status-dot--inactive'}`} />
                      <span className="text-muted-foreground">{mod.enabled ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">v{mod.version}</span>
                      {mod.hasUpdate && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">v{mod.latestVersion}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Blocks Overview ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Blocks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalBlocks} blocks available across {Object.keys(
                BUILTIN_BLOCKS.reduce((acc, b) => { acc[b.source] = true; return acc; }, {} as Record<string, boolean>)
              ).length} modules
            </p>
          </div>
          <Link href="/blocks" className="text-sm text-primary hover:underline">
            Browse all blocks
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUILTIN_BLOCKS.slice(0, 8).map((block) => {
            const catColor = categoryColors[block.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            return (
              <div key={block.type} className="block-grid-item">
                <div className={`mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${catColor}`}>
                  {block.category}
                </div>
                <h4 className="text-sm font-medium">{block.name}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{block.description}</p>
                <p className="mt-1.5 block-source">via <span className="font-medium text-foreground">{block.source}</span></p>
              </div>
            );
          })}
        </div>
        {totalBlocks > 8 && (
          <div className="mt-3 text-center">
            <Link href="/blocks" className="text-sm text-primary hover:underline">
              Show all {totalBlocks} blocks →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
