'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Settings2,
  Trash2,
  Power,
  Globe,
  Code2,
  Shield,
  Zap,
  Image,
  FormInput,
  MessageSquare,
  ShoppingCart,
  Smartphone,
  Package,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const MODULE_DETAILS: Record<string, {
  name: string; description: string; longDescription: string;
  author: string; version: string; icon: string; enabled: boolean;
  capabilities: string[]; dependencies: { name: string; version: string; satisfied: boolean }[];
  settings: { key: string; label: string; type: string; value: string }[];
  blocks: { type: string; name: string; category: string; description: string }[];
}> = {
  mpesa: {
    name: 'M-Pesa Payments',
    description: 'Accept M-Pesa payments via Safaricom Daraja API',
    longDescription: 'Full M-Pesa integration for Kenyan businesses. Supports STK Push, transaction queries, callback handling, and reconciliation. Works with both sandbox and production environments.',
    author: 'Sukit Team',
    version: '1.0.0',
    icon: 'phone',
    enabled: true,
    capabilities: ['api:routes', 'settings:panel', 'blocks:register'],
    dependencies: [
      { name: 'core', version: '>=1.0.0', satisfied: true },
      { name: 'auth', version: '>=1.0.0', satisfied: true },
    ],
    settings: [
      { key: 'consumerKey', label: 'Consumer Key', type: 'encrypted', value: '••••••••••••••••' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'encrypted', value: '••••••••••••••••' },
      { key: 'shortCode', label: 'Shortcode', type: 'text', value: '174379' },
      { key: 'environment', label: 'Environment', type: 'select', value: 'sandbox' },
    ],
    blocks: [
      { type: 'mpesa', name: 'M-Pesa Pay Button', category: 'widgets', description: 'M-Pesa payment button' },
    ],
  },
  media: {
    name: 'Media Library',
    description: 'Upload, optimize, and manage images',
    longDescription: 'Full media management with upload, optimization, cropping, tagging, and folder organization. Supports common image formats and automatic WebP conversion.',
    author: 'Sukit Team',
    version: '2.1.0',
    icon: 'image',
    enabled: true,
    capabilities: ['api:routes', 'settings:panel', 'blocks:register'],
    dependencies: [
      { name: 'core', version: '>=1.0.0', satisfied: true },
      { name: 'storage', version: '>=1.0.0', satisfied: true },
    ],
    settings: [
      { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', value: '10' },
      { key: 'optimizeOnUpload', label: 'Optimize on Upload', type: 'boolean', value: 'true' },
    ],
    blocks: [
      { type: 'image', name: 'Image', category: 'media', description: 'Single image' },
      { type: 'gallery', name: 'Gallery', category: 'media', description: 'Image gallery' },
      { type: 'carousel', name: 'Carousel', category: 'media', description: 'Image carousel' },
    ],
  },
  forms: {
    name: 'Form Builder',
    description: 'Drag-drop form builder with conditional logic',
    longDescription: 'Build complex forms with drag-and-drop. Supports text, email, number, select, checkbox, radio, file upload, and conditional logic for field visibility.',
    author: 'Sukit Team',
    version: '1.2.0',
    icon: 'form',
    enabled: true,
    capabilities: ['api:routes', 'settings:panel', 'blocks:register'],
    dependencies: [
      { name: 'core', version: '>=1.0.0', satisfied: true },
    ],
    settings: [
      { key: 'notifications', label: 'Email Notifications', type: 'boolean', value: 'true' },
      { key: 'honeypot', label: 'Spam Protection', type: 'boolean', value: 'true' },
    ],
    blocks: [
      { type: 'form', name: 'Form', category: 'forms', description: 'Contact form' },
    ],
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Customer review and testimonial management',
    longDescription: 'Collect and display customer testimonials with ratings, images, and moderation workflow. Supports carousel and grid layouts.',
    author: 'Sukit Team',
    version: '1.0.0',
    icon: 'message',
    enabled: false,
    capabilities: ['blocks:register'],
    dependencies: [
      { name: 'core', version: '>=1.0.0', satisfied: true },
    ],
    settings: [],
    blocks: [
      { type: 'testimonial', name: 'Testimonial', category: 'widgets', description: 'Testimonial card' },
    ],
  },
};

const iconMap: Record<string, typeof Package> = {
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

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const mod = MODULE_DETAILS[moduleId];
  const [enabled, setEnabled] = useState(mod?.enabled ?? false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>(
    () => Object.fromEntries((mod?.settings ?? []).map(s => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);

  if (!mod) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="mb-3 size-12 text-muted-foreground/30" />
        <h2 className="text-lg font-semibold">Module not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The module &quot;{moduleId}&quot; doesn&apos;t exist or has been removed.
        </p>
        <Link href="/modules" className="mt-4 text-sm text-primary hover:underline">
          ← Back to modules
        </Link>
      </div>
    );
  }

  const Icon = iconMap[mod.icon] ?? Package;

  return (
    <div className="max-w-4xl space-y-8">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/modules" className="hover:text-foreground">Modules</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{mod.name}</span>
      </div>

      {/* ── Module Header ── */}
      <div className="flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{mod.name}</h1>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              v{mod.version}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">by {mod.author}</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`module-status-dot ${enabled ? 'module-status-dot--active' : 'module-status-dot--inactive'}`} />
              <span className="text-sm font-medium">{enabled ? 'Active' : 'Inactive'}</span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                enabled
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
              }`}
            >
              <Power className="size-3.5" />
              {enabled ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Capabilities ── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Capabilities</h2>
        <div className="flex flex-wrap gap-2">
          {mod.capabilities.map((cap) => (
            <span key={cap} className="module-capability">
              <Check className="size-3" />
              {cap}
            </span>
          ))}
        </div>
      </section>

      {/* ── Description ── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{mod.longDescription}</p>
      </section>

      {/* ── Dependencies ── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Dependencies</h2>
        <div className="divide-y">
          {mod.dependencies.map((dep) => (
            <div
              key={dep.name}
              className={`module-dependency ${dep.satisfied ? 'module-dependency--satisfied' : 'module-dependency--missing'}`}
            >
              <div className="flex items-center gap-2">
                {dep.satisfied
                  ? <Check className="size-3.5 text-green-600" />
                  : <X className="size-3.5 text-destructive" />
                }
                <span className="module-dependency-name">{dep.name}</span>
              </div>
              <span className="module-dependency-version">{dep.version}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Settings ── */}
      {mod.settings.length > 0 && (
        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Settings</h2>
            <button
              onClick={async () => {
                setSaving(true);
                await new Promise(r => setTimeout(r, 600));
                setSaving(false);
              }}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Settings2 className="size-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          <div className="space-y-4">
            {mod.settings.map((setting) => (
              <div key={setting.key} className="module-settings-section">
                <label className="module-settings-label">{setting.label}</label>
                {setting.type === 'boolean' ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettingsValues(prev => ({ ...prev, [setting.key]: prev[setting.key] === 'true' ? 'false' : 'true' }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        settingsValues[setting.key] === 'true' ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                        settingsValues[setting.key] === 'true' ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`} />
                    </button>
                    <span className="text-sm">{settingsValues[setting.key] === 'true' ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ) : (
                  <input
                    type={setting.type === 'encrypted' ? 'password' : 'text'}
                    value={settingsValues[setting.key]}
                    onChange={(e) => setSettingsValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Blocks Registered ── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Blocks Provided ({mod.blocks.length})</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {mod.blocks.map((block) => (
            <div key={block.type} className="flex items-start gap-3 rounded-lg border bg-background p-3">
              <div className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                categoryColors[block.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {block.category}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium">{block.name}</h4>
                <p className="text-xs text-muted-foreground">{block.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Deactivating or uninstalling will remove this module&apos;s blocks and data from your site.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setEnabled(!enabled)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-background"
          >
            <Power className="size-3.5" />
            {enabled ? 'Deactivate' : 'Activate'}
          </button>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive font-medium">Are you sure?</span>
              <button
                onClick={() => {
                  router.push('/modules');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
              >
                <Trash2 className="size-3.5" />
                Uninstall
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-background"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/50 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Uninstall
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
