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
import { SettingsSection, SettingsField } from './shared';

interface HoverEffect {
  cssPreset: string;
  shaderPreset: string;
  speed: number;
  smoothness: number;
}

const CSS_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'scale', label: 'Scale Up' },
  { value: 'lift', label: 'Lift' },
  { value: 'glow', label: 'Glow' },
  { value: 'shadow', label: 'Shadow' },
  { value: 'underline', label: 'Underline' },
  { value: 'blur', label: 'Blur' },
  { value: 'grayscale', label: 'Grayscale' },
];

const SHADER_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'morph', label: 'Morph' },
  { value: 'noise', label: 'Noise' },
  { value: 'particle', label: 'Particle' },
];

export function HoverEffectPicker({
  effect,
  onChange,
}: {
  effect: HoverEffect;
  onChange: (effect: HoverEffect) => void;
}) {
  const setEffect = useCallback(
    (key: keyof HoverEffect, value: unknown) => {
      onChange({ ...effect, [key]: value });
    },
    [effect, onChange]
  );

  return (
    <div className="space-y-3">
      <SettingsSection title="CSS Preset">
        <Select
          value={effect.cssPreset}
          onValueChange={(v) => setEffect('cssPreset', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CSS_PRESETS.map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                className="text-xs"
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection title="Shader Preset">
        <Select
          value={effect.shaderPreset}
          onValueChange={(v) => setEffect('shaderPreset', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHADER_PRESETS.map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                className="text-xs"
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection title="Animation">
        <SettingsField label={`Speed: ${effect.speed.toFixed(1)}x`}>
          <Input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={effect.speed}
            onChange={(e) => setEffect('speed', Number(e.target.value))}
          />
        </SettingsField>
        <SettingsField label={`Smoothness: ${effect.smoothness.toFixed(1)}`}>
          <Input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={effect.smoothness}
            onChange={(e) => setEffect('smoothness', Number(e.target.value))}
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
