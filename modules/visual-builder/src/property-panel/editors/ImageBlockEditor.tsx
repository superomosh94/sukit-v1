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
import {
  SettingsSection,
  SettingsField,
  AssetPathInput,
  NumberInput,
} from './shared';
import { cn } from '../../utils/cn';
import type { Block } from '../../types';

const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
  { value: 'scale-down', label: 'Scale Down' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', label: 'Sm' },
  { value: '0 1px 3px 0 rgb(0 0 0 / 0.1)', label: 'Base' },
  { value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', label: 'Md' },
  { value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', label: 'Lg' },
  { value: '0 20px 25px -5px rgb(0 0 0 / 0.1)', label: 'Xl' },
];

export function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  const props = block.props as Record<string, unknown>;
  const styles = block.styles as Record<string, string | number>;

  const setProp = useCallback(
    (key: string, value: unknown) => {
      onChange({ props: { ...block.props, [key]: value } });
    },
    [block.props, onChange]
  );

  const setStyle = useCallback(
    (key: string, value: string | number) => {
      onChange({ styles: { ...block.styles, [key]: value } });
    },
    [block.styles, onChange]
  );

  return (
    <div className="space-y-3">
      <SettingsSection title="Source">
        <SettingsField label="Image URL">
          <AssetPathInput
            value={(props.src as string) ?? ''}
            onChange={(v) => setProp('src', v)}
            placeholder="https://images.example.com/..."
          />
        </SettingsField>
        <SettingsField label="Alt Text">
          <Input
            value={(props.alt as string) ?? ''}
            onChange={(e) => setProp('alt', e.target.value)}
            className={cn(
              'h-8 text-xs',
              !(props.alt as string) &&
                'border-yellow-500 focus-visible:ring-yellow-500'
            )}
            placeholder="Descriptive alt text"
          />
          {!(props.alt as string) && (
            <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
              Alt text is required for accessibility
            </p>
          )}
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Dimensions">
        <div className="grid grid-cols-2 gap-2">
          <SettingsField label="Width (px)">
            <NumberInput
              value={(props.width as number) ?? ''}
              onChange={(v) => setProp('width', v)}
              min={0}
              max={4096}
              placeholder="Auto"
            />
          </SettingsField>
          <SettingsField label="Aspect Ratio">
            <Input
              type="text"
              value={(styles.aspectRatio as string) ?? ''}
              onChange={(e) => setStyle('aspectRatio', e.target.value)}
              className="h-8 text-xs"
              placeholder="16/9"
            />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection title="Styling">
        <SettingsField label="Object Fit">
          <Select
            value={(props.objectFit as string) ?? 'cover'}
            onValueChange={(v) => setProp('objectFit', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OBJECT_FIT_OPTIONS.map((opt) => (
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
        <div className="grid grid-cols-2 gap-2">
          <SettingsField label="Border Radius (px)">
            <Input
              type="number"
              value={(styles.borderRadius as number) ?? 0}
              onChange={(e) => setStyle('borderRadius', Number(e.target.value))}
              className="h-8 text-xs"
            />
          </SettingsField>
          <SettingsField label="Shadow">
            <Select
              value={(styles.boxShadow as string) ?? 'none'}
              onValueChange={(v) => setStyle('boxShadow', v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHADOW_OPTIONS.map((opt) => (
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
        </div>
      </SettingsSection>

      <SettingsSection title="Link">
        <SettingsField label="URL">
          <Input
            value={(props.linkUrl as string) ?? ''}
            onChange={(e) => setProp('linkUrl', e.target.value)}
            className="h-8 text-xs"
            placeholder="https://..."
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
