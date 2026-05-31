'use client';

import { useCallback } from 'react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SettingsSection, SettingsField } from './shared';
import type { Block } from '../../types';

const TAG_OPTIONS = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'p', label: 'Paragraph' },
  { value: 'span', label: 'Span' },
];

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' },
];

export function TextBlockEditor({
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
      <SettingsSection title="Content">
        <SettingsField label="Text">
          <Textarea
            value={(props.content as string) ?? ''}
            onChange={(e) => setProp('content', e.target.value)}
            className="min-h-[80px] text-xs"
            placeholder="Enter text content..."
          />
        </SettingsField>
        <SettingsField label="Rich Text">
          <Input
            type="checkbox"
            className="h-4 w-4"
            checked={!!props.richText}
            onChange={(e) => setProp('richText', e.target.checked)}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Tag & Alignment">
        <SettingsField label="HTML Tag">
          <Select
            value={(props.tag as string) ?? 'p'}
            onValueChange={(v) => setProp('tag', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAG_OPTIONS.map((opt) => (
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
        <SettingsField label="Text Alignment">
          <Select
            value={String(styles.textAlign ?? 'left')}
            onValueChange={(v) => setStyle('textAlign', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALIGNMENT_OPTIONS.map((opt) => (
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

      <SettingsSection title="Typography">
        <div className="grid grid-cols-2 gap-2">
          <SettingsField label="Font Size (px)">
            <Input
              type="number"
              value={(styles.fontSize as number) ?? 16}
              onChange={(e) => setStyle('fontSize', Number(e.target.value))}
              className="h-8 text-xs"
            />
          </SettingsField>
          <SettingsField label="Color">
            <div className="flex gap-1">
              <Input
                type="color"
                value={(styles.color as string) ?? '#000000'}
                onChange={(e) => setStyle('color', e.target.value)}
                className="h-8 w-10"
              />
              <Input
                value={(styles.color as string) ?? '#000000'}
                onChange={(e) => setStyle('color', e.target.value)}
                className="h-8 flex-1 text-xs font-mono"
              />
            </div>
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
