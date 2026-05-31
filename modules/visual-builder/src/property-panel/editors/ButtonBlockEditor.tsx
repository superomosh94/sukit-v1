'use client';

import { useCallback } from 'react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { SettingsSection, SettingsField } from './shared';
import type { Block } from '../../types';

const VARIANT_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

const SIZE_OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const ICON_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'arrow-right', label: 'Arrow Right' },
  { value: 'arrow-left', label: 'Arrow Left' },
  { value: 'chevron-right', label: 'Chevron Right' },
  { value: 'chevron-down', label: 'Chevron Down' },
  { value: 'external-link', label: 'External Link' },
  { value: 'download', label: 'Download' },
  { value: 'play', label: 'Play' },
  { value: 'plus', label: 'Plus' },
  { value: 'check', label: 'Check' },
  { value: 'x', label: 'Close' },
];

export function ButtonBlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  const props = block.props as Record<string, unknown>;

  const setProp = useCallback(
    (key: string, value: unknown) => {
      onChange({ props: { ...block.props, [key]: value } });
    },
    [block.props, onChange]
  );

  return (
    <div className="space-y-3">
      <SettingsSection title="Content">
        <SettingsField label="Button Text">
          <Input
            value={(props.text as string) ?? ''}
            onChange={(e) => setProp('text', e.target.value)}
            className="h-8 text-xs"
            placeholder="Click me"
          />
        </SettingsField>
        <SettingsField label="URL">
          <Input
            value={(props.url as string) ?? ''}
            onChange={(e) => setProp('url', e.target.value)}
            className="h-8 text-xs"
            placeholder="https://..."
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Variant">
        <Select
          value={(props.variant as string) ?? 'primary'}
          onValueChange={(v) => setProp('variant', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VARIANT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection title="Size">
        <SettingsField label="Button Size">
          <Select
            value={(props.size as string) ?? 'md'}
            onValueChange={(v) => setProp('size', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Layout">
        <div className="flex items-center gap-2">
          <SettingsField label="Full Width" className="flex-1">
            <Button
              type="button"
              variant={(props.fullWidth as boolean) ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-full text-xs"
              onClick={() => setProp('fullWidth', !props.fullWidth)}
            >
              {props.fullWidth ? 'Yes' : 'No'}
            </Button>
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection title="Icon">
        <SettingsField label="Icon">
          <Select
            value={(props.icon as string) ?? ''}
            onValueChange={(v) => setProp('icon', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
