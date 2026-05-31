'use client';

import { useCallback } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { SettingsSection, SettingsField, AssetPathInput } from './shared';
import type { Block } from '../../types';

export function VideoBlockEditor({
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
      <SettingsSection title="Source">
        <SettingsField label="Video URL">
          <AssetPathInput
            value={(props.src as string) ?? ''}
            onChange={(v) => setProp('src', v)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </SettingsField>
        <p className="text-[10px] text-muted-foreground">
          Supports YouTube, Vimeo, and direct MP4 links
        </p>
      </SettingsSection>

      <SettingsSection title="Poster">
        <SettingsField label="Poster Image">
          <AssetPathInput
            value={(props.poster as string) ?? ''}
            onChange={(v) => setProp('poster', v)}
            placeholder="https://images.example.com/poster..."
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Playback">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={!!props.autoplay}
              onChange={(e) => setProp('autoplay', e.target.checked)}
            />
            Autoplay
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={!!props.loop}
              onChange={(e) => setProp('loop', e.target.checked)}
            />
            Loop
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Dimensions">
        <SettingsField label="Width (px / %)">
          <Input
            value={(props.width as string) ?? '100%'}
            onChange={(e) => setProp('width', e.target.value)}
            className="h-8 text-xs"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
