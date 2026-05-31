'use client';

import { useState, useCallback } from 'react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { SettingsField } from './shared';
import { cn } from '../../utils/cn';

export type LinkType = 'url' | 'page' | 'anchor' | 'email' | 'phone' | 'file';

interface LinkPickerProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const LINK_TYPES: { value: LinkType; label: string; prefix: string }[] = [
  { value: 'url', label: 'External URL', prefix: 'https://' },
  { value: 'page', label: 'Internal Page', prefix: '/' },
  { value: 'anchor', label: 'Anchor', prefix: '#' },
  { value: 'email', label: 'Email', prefix: 'mailto:' },
  { value: 'phone', label: 'Phone', prefix: 'tel:' },
  { value: 'file', label: 'File', prefix: '/files/' },
];

function detectLinkType(value: string): LinkType {
  if (value.startsWith('#')) return 'anchor';
  if (value.startsWith('mailto:')) return 'email';
  if (value.startsWith('tel:')) return 'phone';
  if (value.startsWith('/')) return 'page';
  if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
  return 'url';
}

export function LinkPicker({
  value,
  onChange,
  placeholder = 'Select a link...',
}: LinkPickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const linkType = detectLinkType(value);

  const stripPrefix = (val: string, type: LinkType): string => {
    const t = LINK_TYPES.find((l) => l.value === type);
    if (!t) return val;
    return val.replace(t.prefix, '');
  };

  const handleTypeChange = useCallback(
    (type: LinkType) => {
      const t = LINK_TYPES.find((l) => l.value === type);
      if (!t) return;
      const stripped = stripPrefix(value, linkType);
      onChange(`${t.prefix}${stripped}`);
    },
    [value, linkType, onChange]
  );

  const handleValueChange = useCallback(
    (raw: string) => {
      const t = LINK_TYPES.find((l) => l.value === linkType);
      if (!t) return;
      onChange(`${t.prefix}${raw}`);
    },
    [linkType, onChange]
  );

  const currentType = LINK_TYPES.find((l) => l.value === linkType);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={linkType}
          onValueChange={(v: LinkType) => handleTypeChange(v)}
        >
          <SelectTrigger className="h-8 w-32 text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {currentType?.prefix}
          </span>
          <Input
            value={stripPrefix(value, linkType)}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 w-full pl-[calc(0.5rem+2ch)] text-xs"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-[10px] text-primary hover:underline"
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced link settings
      </button>

      {showAdvanced && (
        <div className="space-y-2 rounded-md border p-2">
          <SettingsField label="Open in new tab">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-7 w-full text-xs',
                value.includes('target=_blank') && 'bg-primary/10'
              )}
              onClick={() => {
                const hasTarget = value.includes('target=_blank');
                const newVal = hasTarget
                  ? value
                      .replace(/\?target=_blank/, '')
                      .replace(/&target=_blank/, '')
                  : value + (value.includes('?') ? '&' : '?') + 'target=_blank';
                onChange(newVal);
              }}
            >
              {value.includes('target=_blank') ? 'Yes' : 'No'}
            </Button>
          </SettingsField>
          <SettingsField label="Nofollow">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-7 w-full text-xs',
                value.includes('rel=nofollow') && 'bg-primary/10'
              )}
              onClick={() => {
                const hasRel = value.includes('rel=nofollow');
                const newVal = hasRel
                  ? value
                      .replace(/\?rel=nofollow/, '')
                      .replace(/&rel=nofollow/, '')
                  : value + (value.includes('?') ? '&' : '?') + 'rel=nofollow';
                onChange(newVal);
              }}
            >
              {value.includes('rel=nofollow') ? 'Yes' : 'No'}
            </Button>
          </SettingsField>
        </div>
      )}
    </div>
  );
}
