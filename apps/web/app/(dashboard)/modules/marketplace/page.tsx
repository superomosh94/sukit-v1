'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Star,
  Zap,
  Shield,
  Code2,
  Globe,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  ModulePreviewModal,
  type ModuleItem,
} from '@/components/modules/ModulePreviewModal';
import { useModuleInstaller } from '@/components/modules/useModuleInstaller';

const MARKETPLACE_MODULES: ModuleItem[] = [
  {
    id: 'visual-builder',
    name: 'Visual Builder',
    description:
      'Drag-and-drop page builder with canvas, blocks, and property panel',
    longDescription:
      'Build beautiful pages without code. The Visual Builder provides a live canvas, drag-and-drop blocks, responsive design tools, and a full property panel. Supports 35+ block types including headings, images, buttons, forms, galleries, accordions, tabs, and more.',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 5400,
    rating: 4.8,
    price: 0,
    icon: 'code',
    category: 'builder',
    features: [
      '35+ block types for any layout',
      'Responsive design with breakpoints',
      'Real-time drag-and-drop canvas',
      'Property panel for fine-tuning',
      'Export to clean HTML/CSS',
      'Undo/redo history',
      'Keyboard shortcuts',
      'Custom CSS & animations',
    ],
    screenshots: ['/placeholder.svg', '/placeholder.svg'],
  },
  {
    id: 'site-manager',
    name: 'Site Manager',
    description: 'Multi-site management, page tree, team collaboration',
    longDescription:
      'Manage multiple sites from one dashboard. Organize pages in a hierarchical tree with drag-drop reordering. Invite team members with custom roles (Owner, Admin, Editor, Viewer). Track changes with full activity logging.',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 3200,
    rating: 4.6,
    price: 0,
    icon: 'globe',
    category: 'management',
    features: [
      'Unlimited sites from one dashboard',
      'Hierarchical page tree with drag-drop',
      'Team roles: Owner, Admin, Editor, Viewer',
      'Full activity audit log',
      'One-click site duplication',
      'Import/export entire sites',
      'Page revisions & version history',
      'SEO settings per page',
    ],
    requirements: ['Visual Builder'],
    screenshots: ['/placeholder.svg'],
  },
  {
    id: 'media-library',
    name: 'Media Library',
    description: 'Upload, optimize, and manage images across all sites',
    longDescription:
      'A complete media management solution. Upload images via drag-drop or URL import. Automatically generate WebP/AVIF formats and responsive sizes. Organize with folders and tags. Edit images with crop, resize, rotate, and filters.',
    author: 'SUKIT Core',
    version: '1.0.0',
    downloads: 2800,
    rating: 4.7,
    price: 0,
    icon: 'shield',
    category: 'media',
    features: [
      'Drag-drop upload with progress indicators',
      'Auto WebP/AVIF conversion',
      'Responsive image sizes (srcset)',
      'Folder organization with nesting',
      'Tagging system for filtering',
      'Image crop, resize, rotate, flip',
      'Brightness/contrast/saturation filters',
      'URL generation: direct, markdown, HTML',
    ],
    screenshots: ['/placeholder.svg'],
  },
  {
    id: 'seo',
    name: 'SEO Optimizer',
    description:
      'Advanced SEO tools including meta tags, sitemaps, and analytics',
    longDescription:
      'Boost your search rankings. Auto-generate XML sitemaps, manage meta tags per page, set canonical URLs, control robots directives, and get actionable SEO scores with readability analysis.',
    author: 'SUKIT',
    version: '1.2.0',
    downloads: 1200,
    rating: 4.5,
    price: 0,
    icon: 'shield',
    category: 'seo',
    features: [
      'Per-page meta title & description',
      'Open Graph & Twitter Card support',
      'Auto-generated XML sitemaps',
      'Robots.txt management',
      'SEO score & readability analysis',
      'Canonical URL control',
      'JSON-LD schema support',
      'Broken link detection',
    ],
    screenshots: ['/placeholder.svg'],
  },
  {
    id: 'popup-builder',
    name: 'Popup Builder',
    description: 'Create popups, slide-ins, and notification bars',
    longDescription:
      'Design beautiful popups with visual builder. Choose from modal, slide-in, floating bar, fullscreen, or notification types. Trigger by time, scroll, exit intent, click, or inactivity. A/B test variants.',
    author: 'SUKIT',
    version: '1.0.0',
    downloads: 890,
    rating: 4.3,
    price: 0,
    icon: 'zap',
    category: 'marketing',
    features: [
      '6 popup types: modal, slide-in, bar, fullscreen, notification, inline',
      '8 trigger types: time, scroll, exit, click, inactivity, page views, element, on-load',
      'A/B testing with weighted variants',
      'Rich animations & transitions',
      'Target by page, device, user status',
      'Conversion tracking & analytics',
      'Scheduled campaigns',
    ],
    requirements: ['Visual Builder'],
    screenshots: ['/placeholder.svg'],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Full e-commerce solution with products, cart, and checkout',
    author: 'SUKIT',
    version: '0.8.0',
    downloads: 650,
    rating: 4.2,
    price: 29,
    icon: 'globe',
    category: 'commerce',
    features: [
      'Product management with variants',
      'Shopping cart & checkout',
      'Payment gateway integration',
      'Inventory management',
      'Order tracking & history',
      'Customer accounts',
      'Shipping & tax rules',
      'Coupon & discount system',
    ],
    requirements: ['Site Manager', 'Media Library'],
  },
  {
    id: 'forms-pro',
    name: 'Forms Pro',
    description:
      'Advanced form builder with conditional logic and file uploads',
    author: 'SUKIT',
    version: '1.1.0',
    downloads: 430,
    rating: 4.0,
    price: 9,
    icon: 'shield',
    category: 'forms',
    features: [
      'Conditional logic for field visibility',
      'File upload fields',
      'Multi-step forms',
      'Email notifications',
      'Webhook submissions',
      'Submission analytics',
      'Spam protection (CAPTCHA)',
      'Custom confirmation messages',
    ],
    requirements: ['Visual Builder'],
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description:
      'Visitor analytics with charts, heatmaps, and session recording',
    author: 'SUKIT',
    version: '1.0.0',
    downloads: 780,
    rating: 4.8,
    price: 0,
    icon: 'zap',
    category: 'analytics',
    features: [
      'Real-time visitor count',
      'Page view analytics with charts',
      'Traffic sources dashboard',
      'Heatmap click tracking',
      'Session recordings',
      'Conversion funnel analysis',
      'Custom date range filtering',
      'Export reports as CSV',
    ],
    screenshots: ['/placeholder.svg'],
  },
];

const CATEGORIES = [
  'all',
  'builder',
  'management',
  'media',
  'seo',
  'marketing',
  'commerce',
  'forms',
  'analytics',
];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [previewMod, setPreviewMod] = useState<ModuleItem | null>(null);
  const [justInstalled, setJustInstalled] = useState<string | null>(null);
  const { isInstalled, install, uninstall } = useModuleInstaller();

  const filtered = useMemo(() => {
    return MARKETPLACE_MODULES.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, category]);

  const handleInstall = (mod: ModuleItem) => {
    install(mod);
    setJustInstalled(mod.id);
    setTimeout(() => setJustInstalled(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Extend your site with powerful modules
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((mod) => {
          const installed = isInstalled(mod.id);
          return (
            <div
              key={mod.id}
              className="group relative flex flex-col rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/40 cursor-pointer"
              onClick={() => setPreviewMod({ ...mod, installed })}
            >
              {/* Icon */}
              <div className="flex items-start gap-4 p-5 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {mod.icon === 'globe' ? (
                    <Globe className="size-6" />
                  ) : mod.icon === 'code' ? (
                    <Code2 className="size-6" />
                  ) : mod.icon === 'zap' ? (
                    <Zap className="size-6" />
                  ) : (
                    <Shield className="size-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{mod.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    by {mod.author}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="px-5 text-xs text-muted-foreground line-clamp-2 flex-1">
                {mod.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between px-5 pb-3 pt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {mod.rating}
                  </span>
                  <span>{mod.downloads.toLocaleString()}</span>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 capitalize">
                  {mod.category}
                </span>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t px-5 py-3">
                <span className="text-sm font-medium">
                  {mod.price === 0 ? 'Free' : `$${mod.price}`}
                </span>
                {installed ? (
                  <span className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                    <Check className="size-3" />
                    Installed
                  </span>
                ) : justInstalled === mod.id ? (
                  <span className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                    <Check className="size-3" />
                    Installed!
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstall(mod);
                    }}
                    className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Install
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Download className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No modules found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {query
              ? 'Try a different search term'
              : 'No modules in this category'}
          </p>
        </div>
      )}

      {/* Preview modal */}
      {previewMod && (
        <ModulePreviewModal
          module={previewMod}
          open={!!previewMod}
          onClose={() => setPreviewMod(null)}
          onInstall={(m) => {
            handleInstall(m);
            setPreviewMod((prev) =>
              prev ? { ...prev, installed: true } : null
            );
          }}
          onUninstall={(m) => {
            uninstall(m);
            setPreviewMod((prev) =>
              prev ? { ...prev, installed: false } : null
            );
          }}
        />
      )}
    </div>
  );
}
