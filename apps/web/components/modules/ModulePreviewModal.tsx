'use client';

import { useState } from 'react';
import {
  X,
  Star,
  Download,
  Check,
  Shield,
  Code2,
  Globe,
  Zap,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModuleItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  price: number;
  icon?: string;
  category: string;
  screenshots?: string[];
  features?: string[];
  requirements?: string[];
  installed?: boolean;
}

interface ModulePreviewModalProps {
  module: ModuleItem;
  open: boolean;
  onClose: () => void;
  onInstall: (mod: ModuleItem) => void;
  onUninstall: (mod: ModuleItem) => void;
}

export function ModulePreviewModal({
  module: mod,
  open,
  onClose,
  onInstall,
  onUninstall,
}: ModulePreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-card px-6 py-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {mod.icon === 'globe' ? (
                <Globe className="size-7" />
              ) : mod.icon === 'code' ? (
                <Code2 className="size-7" />
              ) : mod.icon === 'zap' ? (
                <Zap className="size-7" />
              ) : (
                <Shield className="size-7" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{mod.name}</h2>
              <p className="text-sm text-muted-foreground">
                by {mod.author} · v{mod.version}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {mod.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="size-3.5" />
                  {mod.downloads.toLocaleString()} downloads
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 capitalize">
                  {mod.category}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Screenshots */}
          {mod.screenshots && mod.screenshots.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mod.screenshots.map((src, i) => (
                  <div
                    key={i}
                    className="h-40 w-72 shrink-0 rounded-lg bg-muted flex items-center justify-center border"
                  >
                    <img
                      src={src}
                      alt={`${mod.name} screenshot ${i + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mod.longDescription ?? mod.description}
            </p>
          </div>

          {/* Features */}
          {mod.features && mod.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">What You Get</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {mod.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {mod.requirements && mod.requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Requirements</h3>
              <div className="space-y-1">
                {mod.requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground"
                  >
                    <Shield className="size-3.5 shrink-0" />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex items-center justify-between border-t bg-card px-6 py-4">
          <div>
            <span className="text-lg font-bold">
              {mod.price === 0 ? 'Free' : `$${mod.price}`}
            </span>
            {mod.price > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                one-time
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Close
            </button>
            {mod.installed ? (
              <button
                onClick={() => onUninstall(mod)}
                className="rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Uninstall
              </button>
            ) : (
              <button
                onClick={() => onInstall(mod)}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {mod.price === 0 ? 'Install' : 'Purchase & Install'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
