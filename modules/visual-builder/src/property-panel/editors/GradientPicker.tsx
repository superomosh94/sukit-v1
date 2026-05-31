'use client';

import { useState, useCallback, useMemo } from 'react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SettingsField } from './shared';
import { cn } from '../../utils/cn';

const DIRECTIONS = [
  { value: 'to bottom', label: 'Top → Bottom' },
  { value: 'to top', label: 'Bottom → Top' },
  { value: 'to right', label: 'Left → Right' },
  { value: 'to left', label: 'Right → Left' },
  { value: 'to bottom right', label: '↘ Diagonal' },
  { value: 'to bottom left', label: '↙ Diagonal' },
  { value: 'to top right', label: '↗ Diagonal' },
  { value: 'to top left', label: '↖ Diagonal' },
];

export function GradientPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (gradient: string) => void;
}) {
  const parsed = useMemo(() => {
    const match = value?.match(/^linear-gradient\((.+)\)$/);
    if (!match)
      return { direction: 'to bottom', colors: ['#000000', '#ffffff'] };
    const inner = match[1];
    const parts = inner.split(/,\s*(?=#[0-9a-fA-F]{3,8}|rgb|hsl)/);
    const dir = parts.length > 1 ? parts[0].trim() : 'to bottom';
    const colors =
      parts.length > 1
        ? parts.slice(1).map((c) => c.trim())
        : ['#000000', '#ffffff'];
    return { direction: dir, colors };
  }, [value]);

  const setDirection = useCallback(
    (dir: string) => {
      onChange(`linear-gradient(${dir}, ${parsed.colors.join(', ')})`);
    },
    [parsed.colors, onChange]
  );

  const setColor = useCallback(
    (index: number, color: string) => {
      const colors = [...parsed.colors];
      colors[index] = color || '#000000';
      onChange(`linear-gradient(${parsed.direction}, ${colors.join(', ')})`);
    },
    [parsed, onChange]
  );

  const addColor = useCallback(() => {
    const colors = [...parsed.colors, '#ffffff'];
    onChange(`linear-gradient(${parsed.direction}, ${colors.join(', ')})`);
  }, [parsed, onChange]);

  const removeColor = useCallback(
    (index: number) => {
      if (parsed.colors.length <= 2) return;
      const colors = parsed.colors.filter((_, i) => i !== index);
      onChange(`linear-gradient(${parsed.direction}, ${colors.join(', ')})`);
    },
    [parsed, onChange]
  );

  return (
    <div className="space-y-2">
      <div
        className="h-10 w-full rounded-md border"
        style={{ background: value || 'none' }}
      />
      <SettingsField label="Direction">
        <Select value={parsed.direction} onValueChange={setDirection}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIRECTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value} className="text-xs">
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsField>
      {parsed.colors.map((color, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(i, e.target.value)}
            className="size-7 shrink-0 cursor-pointer rounded border"
          />
          <Input
            value={color}
            onChange={(e) => setColor(i, e.target.value)}
            className="h-7 flex-1 text-xs font-mono"
          />
          {parsed.colors.length > 2 && (
            <button
              onClick={() => removeColor(i)}
              className="text-xs text-destructive hover:underline"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addColor}
        className="text-xs text-primary hover:underline"
      >
        + Add color stop
      </button>
    </div>
  );
}
