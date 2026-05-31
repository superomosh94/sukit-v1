'use client';

import { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

interface ThemePalette {
  [slug: string]: string;
}

interface ThemeCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  isActive: boolean;
  palette: ThemePalette;
  onActivate: (slug: string) => void;
}

const sampleElements = [
  { label: 'Heading', tag: 'h1', text: 'Sample Heading' },
  {
    label: 'Body',
    tag: 'p',
    text: 'This is sample body text that demonstrates how typography looks with this theme.',
  },
  { label: 'Button', tag: 'button', text: 'Button' },
  { label: 'Link', tag: 'a', text: 'Sample Link' },
];

export function ThemeCard({
  id,
  name,
  slug,
  description,
  author,
  isActive,
  palette,
  onActivate,
}: ThemeCardProps) {
  const [preview, setPreview] = useState(false);
  const [activating, setActivating] = useState(false);

  const bg =
    palette['white'] ||
    palette['slate-50'] ||
    palette['off-white'] ||
    palette['mint'] ||
    palette['amber-50'] ||
    palette['sky-50'] ||
    palette['gray-50'] ||
    '#ffffff';
  const text =
    palette['slate-900'] ||
    palette['navy-900'] ||
    palette['forest-900'] ||
    palette['dark-900'] ||
    palette['sky-900'] ||
    palette['gray-900'] ||
    '#000000';
  const primary =
    palette['blue-500'] ||
    palette['gold-500'] ||
    palette['green-500'] ||
    palette['orange-500'] ||
    palette['sky-500'] ||
    palette['indigo-500'] ||
    '#3b82f6';
  const surface =
    palette['slate-800'] ||
    palette['navy-700'] ||
    palette['forest-700'] ||
    palette['amber-900'] ||
    palette['sky-700'] ||
    palette['gray-200'] ||
    '#1e293b';
  const muted =
    palette['slate-200'] ||
    palette['navy-600'] ||
    palette['forest-800'] ||
    palette['dark-800'] ||
    palette['sky-950'] ||
    palette['gray-600'] ||
    '#94a3b8';
  const accent =
    palette['emerald-500'] ||
    palette['gold-600'] ||
    palette['green-400'] ||
    palette['amber-400'] ||
    palette['sky-400'] ||
    palette['indigo-400'] ||
    '#10b981';
  const lightBg =
    palette['slate-50'] ||
    palette['cream'] ||
    palette['mint'] ||
    palette['amber-50'] ||
    palette['sky-50'] ||
    palette['gray-50'] ||
    '#f8fafc';
  const border =
    palette['slate-200'] ||
    palette['navy-600'] ||
    palette['forest-800'] ||
    palette['dark-800'] ||
    palette['sky-700'] ||
    palette['gray-200'] ||
    '#e2e8f0';

  const handleActivate = async () => {
    setActivating(true);
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', slug }),
      });
      if (!res.ok) throw new Error('Failed to activate theme');
      toast.success(`"${name}" activated`);
      onActivate(slug);
    } catch {
      toast.error('Failed to activate theme');
    } finally {
      setActivating(false);
    }
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        isActive && 'ring-2 ring-primary'
      )}
    >
      {/* Preview Area */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ backgroundColor: bg, color: text }}
        onClick={() => setPreview(!preview)}
      >
        {!preview ? (
          /* Palette Preview */
          <div className="p-4 space-y-3">
            <div className="flex gap-1.5">
              {Object.entries(palette)
                .slice(0, 8)
                .map(([slug, color]) => (
                  <div
                    key={slug}
                    className="h-6 flex-1 rounded-md border border-black/10"
                    style={{ backgroundColor: color }}
                    title={slug}
                  />
                ))}
            </div>
            <div className="space-y-1.5">
              <div
                className="h-2 rounded-full opacity-80"
                style={{ backgroundColor: primary, width: '60%' }}
              />
              <div
                className="h-2 rounded-full opacity-60"
                style={{ backgroundColor: muted, width: '40%' }}
              />
              <div
                className="h-2 rounded-full opacity-40"
                style={{ backgroundColor: muted, width: '80%' }}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <div
                className="h-7 rounded-md px-3 text-xs font-medium flex items-center justify-center"
                style={{ backgroundColor: primary, color: bg }}
              >
                Button
              </div>
              <div
                className="h-7 rounded-md px-3 text-xs font-medium flex items-center justify-center border"
                style={{ borderColor: border, color: text }}
              >
                Outline
              </div>
            </div>
          </div>
        ) : (
          /* Full Preview */
          <div
            className="p-4 space-y-3 text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: primary }}
              >
                Theme Preview
              </span>
              <span className="text-[10px] opacity-60" style={{ color: muted }}>
                {name}
              </span>
            </div>
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: lightBg }}
            >
              <h1 className="text-lg font-bold" style={{ color: text }}>
                {sampleElements[0].text}
              </h1>
              <p className="text-xs leading-relaxed" style={{ color: muted }}>
                {sampleElements[1].text}
              </p>
              <div className="flex gap-2 pt-1">
                <span
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: primary, color: bg }}
                >
                  {sampleElements[2].text}
                </span>
                <span
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{ color: primary }}
                >
                  {sampleElements[3].text}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ backgroundColor: accent, width: '30%' }}
              />
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ backgroundColor: primary, width: '50%' }}
              />
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ backgroundColor: muted, width: '20%' }}
              />
            </div>
          </div>
        )}

        {/* Preview toggle hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className="text-[10px] font-medium rounded-full px-2 py-0.5 backdrop-blur-sm"
            style={{ backgroundColor: bg + 'cc', color: muted }}
          >
            {preview ? (
              <EyeOff className="inline size-3 mr-0.5" />
            ) : (
              <Eye className="inline size-3 mr-0.5" />
            )}
            {preview ? 'Palette' : 'Preview'}
          </span>
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          {isActive && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Check className="size-3" />
              Active
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">by {author}</span>
          <Button
            size="sm"
            variant={isActive ? 'outline' : 'default'}
            disabled={isActive || activating}
            onClick={handleActivate}
          >
            {activating ? 'Activating...' : isActive ? 'Active' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
