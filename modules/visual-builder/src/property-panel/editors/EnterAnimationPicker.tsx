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
import type { Animation } from '../../types';

const ANIMATION_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'scaleIn', label: 'Scale In' },
  { value: 'rotateIn', label: 'Rotate In' },
  { value: 'flipIn', label: 'Flip In' },
  { value: 'typewriter', label: 'Typewriter' },
];

const CASCADE_LEVELS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Block' },
  { value: 2, label: 'Column' },
  { value: 3, label: 'Section' },
  { value: 4, label: 'Page' },
];

export function EnterAnimationPicker({
  animation,
  onChange,
}: {
  animation: Animation;
  onChange: (animation: Animation) => void;
}) {
  const setAnim = useCallback(
    (key: keyof Animation, value: unknown) => {
      onChange({ ...animation, [key]: value });
    },
    [animation, onChange]
  );

  return (
    <div className="space-y-3">
      <SettingsSection title="Animation Type">
        <Select
          value={animation.type}
          onValueChange={(v) => setAnim('type', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_PRESETS.map((preset) => (
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

      <SettingsSection title="Timing">
        <SettingsField label={`Duration: ${animation.duration}ms`}>
          <Input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={animation.duration}
            onChange={(e) => setAnim('duration', Number(e.target.value))}
          />
        </SettingsField>
        <SettingsField label={`Delay: ${animation.delay}ms`}>
          <Input
            type="range"
            min={0}
            max={3000}
            step={50}
            value={animation.delay}
            onChange={(e) => setAnim('delay', Number(e.target.value))}
          />
        </SettingsField>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>
            {animation.type !== 'none'
              ? (animation.duration + animation.delay) / 1000
              : 0}
            s
          </span>
        </div>
      </SettingsSection>

      <SettingsSection title="Cascade">
        <SettingsField label="Cascade Level">
          <Select
            value={String(animation.cascadeLevel)}
            onValueChange={(v) => setAnim('cascadeLevel', Number(v))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CASCADE_LEVELS.map((level) => (
                <SelectItem
                  key={level.value}
                  value={String(level.value)}
                  className="text-xs"
                >
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
        <SettingsField
          label={`Stagger Delay: ${animation.cascadeLevel * 100}ms`}
        >
          <p className="text-[10px] text-muted-foreground">
            Each cascade level adds 100ms stagger delay
          </p>
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
