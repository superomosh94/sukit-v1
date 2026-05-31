'use client';

import { useState, useCallback, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { SettingsSection, SettingsField } from './shared';
import { useBuilderStore } from '../../stores/builderStore';
import { cn } from '../../utils/cn';

const PREDEFINED_COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#ffffff', name: 'White' },
  { hex: '#0f172a', name: 'Slate 900' },
  { hex: '#1e293b', name: 'Slate 800' },
  { hex: '#334155', name: 'Slate 700' },
  { hex: '#475569', name: 'Slate 600' },
  { hex: '#64748b', name: 'Slate 500' },
  { hex: '#94a3b8', name: 'Slate 400' },
  { hex: '#cbd5e1', name: 'Slate 300' },
  { hex: '#e2e8f0', name: 'Slate 200' },
  { hex: '#f1f5f9', name: 'Slate 100' },
  { hex: '#f8fafc', name: 'Slate 50' },
  { hex: '#ef4444', name: 'Red 500' },
  { hex: '#f97316', name: 'Orange 500' },
  { hex: '#eab308', name: 'Yellow 500' },
  { hex: '#22c55e', name: 'Green 500' },
  { hex: '#06b6d4', name: 'Cyan 500' },
  { hex: '#3b82f6', name: 'Blue 500' },
  { hex: '#6366f1', name: 'Indigo 500' },
  { hex: '#a855f7', name: 'Purple 500' },
  { hex: '#ec4899', name: 'Pink 500' },
];

const COLOR_BLIND_SAFE_PALETTE = [
  { hex: '#0077BB', name: 'Blue' },
  { hex: '#EE7733', name: 'Orange' },
  { hex: '#33BBEE', name: 'Cyan' },
  { hex: '#EE3377', name: 'Magenta' },
  { hex: '#CC3311', name: 'Red' },
  { hex: '#009988', name: 'Teal' },
  { hex: '#BBBBBB', name: 'Grey' },
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#AA3377', name: 'Purple' },
  { hex: '#EE8866', name: 'Peach' },
  { hex: '#44BB99', name: 'Mint' },
];

export function ColorSwatchPicker({
  value,
  onChange,
  opacity,
  onOpacityChange,
  label = 'Color',
}: {
  value: string;
  onChange: (color: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  label?: string;
}) {
  const themeColors = useBuilderStore((s) => s.themeColors);
  const [customHex, setCustomHex] = useState(value);
  const [showPicker, setShowPicker] = useState(false);

  const allSwatches = useMemo(() => {
    const seen = new Set<string>();
    const result: { hex: string; name: string }[] = [];
    for (const c of themeColors) {
      const key = c.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ hex: c, name: c });
      }
    }
    for (const c of PREDEFINED_COLORS) {
      if (!seen.has(c.hex.toLowerCase())) {
        seen.add(c.hex.toLowerCase());
        result.push(c);
      }
    }
    return result;
  }, [themeColors]);

  const handleCustomChange = useCallback(
    (hex: string) => {
      const clean = hex.startsWith('#') ? hex : `#${hex}`;
      setCustomHex(clean);
      onChange(clean);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      <SettingsSection title={label}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-8 shrink-0 rounded-md border"
            style={{ backgroundColor: value }}
            onClick={() => setShowPicker(!showPicker)}
            aria-label={`Current color: ${value}. Click to open picker.`}
            title={value}
          />
          <Input
            value={customHex}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="h-8 flex-1 text-xs font-mono"
            placeholder="#000000"
            aria-label="Hex color value"
          />
        </div>
        {showPicker && (
          <div className="pt-2">
            <HexColorPicker
              color={
                /^#[0-9A-Fa-f]{6}$/.test(customHex) ? customHex : '#000000'
              }
              onChange={handleCustomChange}
              className="w-full!"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs"
              onClick={() => setShowPicker(false)}
            >
              Done
            </Button>
          </div>
        )}
      </SettingsSection>

      <div
        className="grid grid-cols-7 gap-1.5"
        role="listbox"
        aria-label="Color swatches"
      >
        {allSwatches.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            aria-label={`${c.name} (${c.hex})`}
            onClick={() => handleCustomChange(c.hex)}
            className={cn(
              'group relative h-6 w-full rounded-md border border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              value.toLowerCase() === c.hex.toLowerCase() &&
                'ring-2 ring-primary ring-offset-1'
            )}
            style={{ backgroundColor: c.hex }}
          >
            <span className="invisible group-hover:visible group-focus-visible:visible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md">
              {c.name}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="mt-1 w-full rounded border border-dashed py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
      >
        {showPicker ? 'Hide palette' : 'Color-blind safe palette'}
      </button>

      {showPicker && (
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {COLOR_BLIND_SAFE_PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              aria-label={`${c.name} (${c.hex})`}
              onClick={() => handleCustomChange(c.hex)}
              className={cn(
                'group relative h-5 w-full rounded-md border border-border transition-transform hover:scale-110',
                value.toLowerCase() === c.hex.toLowerCase() &&
                  'ring-2 ring-primary ring-offset-1'
              )}
              style={{ backgroundColor: c.hex }}
            >
              <span className="invisible group-hover:visible absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-[9px] text-popover-foreground shadow-md">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {onOpacityChange && (
        <SettingsField label="Opacity">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity ?? 1}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full"
          />
        </SettingsField>
      )}
    </div>
  );
}
