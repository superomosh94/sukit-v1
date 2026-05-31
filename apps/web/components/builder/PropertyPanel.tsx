'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBuilderStore } from '@/lib/builder/store';
import { blockRegistry } from '@/lib/builder/block-registry';
import type { Block, Section, DeviceViewport } from '@/lib/builder/types';
import { cn } from '@/lib/utils/cn';
import { TextBlockEditor } from '@/components/builder/editors/TextBlockEditor';
import { ImageBlockEditor } from '@/components/builder/editors/ImageBlockEditor';
import { ButtonBlockEditor } from '@/components/builder/editors/ButtonBlockEditor';
import { VideoBlockEditor } from '@/components/builder/editors/VideoBlockEditor';
import { EnterAnimationPicker } from '@/components/builder/editors/EnterAnimationPicker';
import { HoverEffectPicker } from '@/components/builder/editors/HoverEffectPicker';
import { ColorSwatchPicker } from '@/components/builder/editors/ColorSwatchPicker';

function findSelectedBlock(
  sections: Section[],
  selection: { id: string; type: 'section' | 'column' | 'block' } | null
): { section: Section; columnId: string; block: Block } | null {
  if (!selection || selection.type !== 'block') return null;
  for (const s of sections) {
    for (const c of s.columns) {
      const block = c.blocks.find((b) => b.id === selection.id);
      if (block) return { section: s, columnId: c.id, block };
    }
  }
  return null;
}

function findSelectedSection(
  sections: Section[],
  selection: { id: string; type: 'section' | 'column' | 'block' } | null
): Section | null {
  if (!selection || selection.type !== 'section') return null;
  return sections.find((s) => s.id === selection.id) ?? null;
}

function StyleInput({
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(type === 'number' ? Number(e.target.value) : e.target.value)
        }
        min={min}
        max={max}
        step={step}
        className="h-8 text-xs"
      />
    </div>
  );
}

function ContentTab({
  block,
  sectionId,
  columnId,
}: {
  block: Block;
  sectionId: string;
  columnId: string;
}) {
  const updateBlock = useBuilderStore((s) => s.updateBlock);

  const handleChange = (updates: Partial<Block>) => {
    updateBlock(sectionId, columnId, block.id, updates);
  };

  switch (block.blockType) {
    case 'text':
    case 'heading':
    case 'paragraph':
      return <TextBlockEditor block={block} onChange={handleChange} />;
    case 'image':
    case 'picture':
      return <ImageBlockEditor block={block} onChange={handleChange} />;
    case 'button':
      return <ButtonBlockEditor block={block} onChange={handleChange} />;
    case 'video':
      return <VideoBlockEditor block={block} onChange={handleChange} />;
    default: {
      const registration = blockRegistry.getBlockType(block.blockType);
      if (!registration?.schema) {
        return (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No editable properties for this block
          </p>
        );
      }

      const schemaProps = registration.schema.properties;
      return (
        <div className="space-y-3">
          {Object.entries(schemaProps).map(([key, _zodSchema]) => {
            const value = (block.props as Record<string, unknown>)[key] ?? '';
            return (
              <div key={key} className="space-y-1">
                <Label className="text-xs capitalize text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  value={String(value)}
                  onChange={(e) =>
                    handleChange({
                      props: { ...block.props, [key]: e.target.value },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            );
          })}
        </div>
      );
    }
  }
}

function SpacingInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {['Top', 'Right', 'Bottom', 'Left'].map((dir) => {
          const key = `${label.toLowerCase()}${dir}`;
          return (
            <div key={dir} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground">
                {dir[0]}
              </span>
              <Input
                type="number"
                value={(values as any)[key] ?? 0}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="h-7 w-full text-center text-xs"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StylesTab({
  block,
  sectionId,
  columnId,
}: {
  block: Block;
  sectionId: string;
  columnId: string;
}) {
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const styles = block.styles as Record<string, string | number>;
  const spacingValues: Record<string, number> = {
    paddingTop: (styles.paddingTop as number) ?? 0,
    paddingRight: (styles.paddingRight as number) ?? 0,
    paddingBottom: (styles.paddingBottom as number) ?? 0,
    paddingLeft: (styles.paddingLeft as number) ?? 0,
    marginTop: (styles.marginTop as number) ?? 0,
    marginRight: (styles.marginRight as number) ?? 0,
    marginBottom: (styles.marginBottom as number) ?? 0,
    marginLeft: (styles.marginLeft as number) ?? 0,
  };

  const updateStyle = (key: string, value: string | number) => {
    updateBlock(sectionId, columnId, block.id, {
      styles: { ...styles, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Typography</Label>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Font Size (px)"
            type="number"
            value={styles.fontSize ?? 16}
            onChange={(v) => updateStyle('fontSize', v)}
          />
          <Select
            value={String((styles as any).fontWeight ?? '400')}
            onValueChange={(v) => updateStyle('fontWeight', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => (
                <SelectItem key={w} value={String(w)} className="text-xs">
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="text"
            placeholder="font-family"
            value={(styles.fontFamily as string) ?? ''}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            type="color"
            value={(styles.color as string) ?? '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      <SpacingInput
        label="Padding"
        values={spacingValues}
        onChange={(key, value) => updateStyle(key, value)}
      />
      <SpacingInput
        label="Margin"
        values={spacingValues}
        onChange={(key, value) => updateStyle(key, value)}
      />

      <div className="space-y-2">
        <Label className="text-xs font-medium">Background</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="color"
            value={(styles.backgroundColor as string) ?? '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="h-8"
          />
          <Input
            type="text"
            placeholder="bg image URL"
            value={(styles.backgroundImage as string) ?? ''}
            onChange={(e) => updateStyle('backgroundImage', e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Gradient</span>
            {(styles as any).backgroundGradient ? (
              <button
                type="button"
                onClick={() => updateStyle('backgroundGradient', '')}
                className="text-[10px] text-destructive hover:underline"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  updateStyle(
                    'backgroundGradient',
                    'linear-gradient(to bottom, #000000, #ffffff)'
                  )
                }
                className="text-[10px] text-primary hover:underline"
              >
                + Add
              </button>
            )}
          </div>
          {(styles as any).backgroundGradient ? (
            <>
              <div
                className="h-6 w-full rounded border"
                style={{ background: (styles as any).backgroundGradient }}
              />
              <Input
                value={(styles as any).backgroundGradient}
                onChange={(e) =>
                  updateStyle('backgroundGradient', e.target.value)
                }
                className="h-7 text-xs font-mono"
                placeholder="linear-gradient(...)"
              />
              <div className="flex gap-1">
                <input
                  type="color"
                  value="#000000"
                  onChange={(e) => {
                    const g = (styles as any).backgroundGradient as string;
                    const updated = g.replace(
                      /#[0-9a-fA-F]{6}/,
                      e.target.value
                    );
                    updateStyle('backgroundGradient', updated);
                  }}
                  className="size-6 cursor-pointer rounded border"
                  title="Replace first color"
                />
                <input
                  type="color"
                  value="#ffffff"
                  onChange={(e) => {
                    const g = (styles as any).backgroundGradient as string;
                    const parts = g.match(/(.*,\s*)(#[0-9a-fA-F]{6})(.*)/);
                    if (parts) {
                      updateStyle(
                        'backgroundGradient',
                        parts[1] + e.target.value + (parts[3] || '')
                      );
                    }
                  }}
                  className="size-6 cursor-pointer rounded border"
                  title="Replace last color"
                />
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Border</Label>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Width (px)"
            type="number"
            value={(styles.borderWidth as number) ?? 0}
            onChange={(v) => updateStyle('borderWidth', v)}
          />
          <StyleInput
            label="Radius (px)"
            type="number"
            value={(styles.borderRadius as number) ?? 0}
            onChange={(v) => updateStyle('borderRadius', v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="color"
            value={(styles.borderColor as string) ?? '#000000'}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            className="h-8"
          />
          <Select
            value={(styles.borderStyle as string) ?? 'solid'}
            onValueChange={(v) => updateStyle('borderStyle', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['solid', 'dashed', 'dotted', 'double', 'none'].map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Shadow</Label>
        <Select
          value={(styles.boxShadow as string) ?? 'none'}
          onValueChange={(v) => updateStyle('boxShadow', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: 'none', label: 'None' },
              { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', label: 'Sm' },
              { value: '0 1px 3px 0 rgb(0 0 0 / 0.1)', label: 'Base' },
              { value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', label: 'Md' },
              { value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', label: 'Lg' },
              { value: '0 20px 25px -5px rgb(0 0 0 / 0.1)', label: 'Xl' },
            ].map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StyleInput
        label="Opacity"
        type="number"
        min={0}
        max={1}
        step={0.05}
        value={(styles.opacity as number) ?? 1}
        onChange={(v) => updateStyle('opacity', v)}
      />
    </div>
  );
}

function AdvancedTab({
  block,
  sectionId,
  columnId,
}: {
  block: Block;
  sectionId: string;
  columnId: string;
}) {
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const props = block.props as Record<string, unknown>;

  const handleChange = (updates: Partial<Block>) => {
    updateBlock(sectionId, columnId, block.id, updates);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">HTML ID</Label>
        <Input
          value={(props.htmlId as string) ?? ''}
          onChange={(e) =>
            handleChange({
              props: { ...block.props, htmlId: e.target.value },
            })
          }
          className="h-8 text-xs"
          placeholder="custom-id"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">CSS Class</Label>
        <Input
          value={(props.cssClass as string) ?? ''}
          onChange={(e) =>
            handleChange({
              props: { ...block.props, cssClass: e.target.value },
            })
          }
          className="h-8 text-xs"
          placeholder="my-custom-class"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Custom CSS</Label>
        <Textarea
          value={(props.customCss as string) ?? ''}
          onChange={(e) =>
            handleChange({
              props: { ...block.props, customCss: e.target.value },
            })
          }
          className="min-h-[100px] text-xs font-mono"
          placeholder=".my-block { ... }"
        />
      </div>

      <div className="border-t border-border/50 pt-3">
        <Label className="mb-2 block text-xs font-medium text-muted-foreground">
          Enter Animation
        </Label>
        <EnterAnimationPicker
          animation={block.animation}
          onChange={(animation) => handleChange({ animation })}
        />
      </div>

      <div className="border-t border-border/50 pt-3">
        <Label className="mb-2 block text-xs font-medium text-muted-foreground">
          Hover Effect
        </Label>
        <HoverEffectPicker
          effect={{
            cssPreset: (props.hoverEffect as string) ?? 'none',
            shaderPreset: (props.shaderPreset as string) ?? 'none',
            speed: (props.hoverSpeed as number) ?? 1,
            smoothness: (props.hoverSmoothness as number) ?? 0.5,
          }}
          onChange={(effect) =>
            handleChange({
              props: {
                ...block.props,
                hoverEffect: effect.cssPreset,
                shaderPreset: effect.shaderPreset,
                hoverSpeed: effect.speed,
                hoverSmoothness: effect.smoothness,
              },
            })
          }
        />
      </div>

      <div className="border-t border-border/50 pt-3">
        <Label className="mb-2 block text-xs font-medium text-muted-foreground">
          Background Color
        </Label>
        <ColorSwatchPicker
          value={(block.styles.backgroundColor as string) ?? '#ffffff'}
          onChange={(color) =>
            handleChange({
              styles: { ...block.styles, backgroundColor: color },
            })
          }
        />
      </div>
    </div>
  );
}

function ResponsiveTab({
  block,
  sectionId,
  columnId,
}: {
  block: Block;
  sectionId: string;
  columnId: string;
}) {
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const viewport = useBuilderStore((s) => s.viewport);

  if (viewport === 'desktop') {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Switch to tablet or phone viewport to set overrides
      </p>
    );
  }

  const overrides = block.responsive[viewport] ?? {};

  const setOverride = (key: string, value: unknown) => {
    const newOverrides = { ...overrides } as Record<string, unknown>;
    newOverrides[key] = value;
    updateBlock(sectionId, columnId, block.id, {
      responsive: {
        ...block.responsive,
        [viewport]: newOverrides,
      } as typeof block.responsive,
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Overrides for <strong>{viewport}</strong>
      </p>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Hidden</Label>
        <Button
          variant={(overrides as any).hidden ? 'default' : 'outline'}
          size="sm"
          className="w-full text-xs"
          onClick={() => setOverride('hidden', !(overrides as any).hidden)}
        >
          {(overrides as any).hidden ? 'Hidden' : 'Visible'}
        </Button>
      </div>
      <StyleInput
        label="Font Size (px)"
        type="number"
        value={(overrides as any).fontSize ?? block.styles.fontSize ?? 16}
        onChange={(v) => setOverride('fontSize', v)}
      />
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Margin (px)</Label>
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="number"
            placeholder="Top"
            value={(overrides as any).marginTop ?? block.styles.marginTop ?? 0}
            onChange={(e) => setOverride('marginTop', Number(e.target.value))}
            className="h-7 text-xs"
          />
          <Input
            type="number"
            placeholder="Bottom"
            value={
              (overrides as any).marginBottom ?? block.styles.marginBottom ?? 0
            }
            onChange={(e) =>
              setOverride('marginBottom', Number(e.target.value))
            }
            className="h-7 text-xs"
          />
        </div>
      </div>
      <StyleInput
        label="Padding (px)"
        type="number"
        value={(overrides as any).padding ?? 0}
        onChange={(v) => setOverride('padding', v)}
      />
      <StyleInput
        label="Width (px)"
        type="number"
        value={(overrides as any).width ?? block.styles.width ?? 'auto'}
        onChange={(v) => setOverride('width', v)}
      />
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Color
        </Label>
        <Input
          type="color"
          value={
            (overrides as any).backgroundColor ??
            (block.styles.backgroundColor as string) ??
            '#ffffff'
          }
          onChange={(e) => setOverride('backgroundColor', e.target.value)}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Display</Label>
        <Select
          value={(overrides as any).display ?? ''}
          onValueChange={(v) => setOverride('display', v || undefined)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Inherit" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: '', label: 'Inherit' },
              { value: 'block', label: 'Block' },
              { value: 'flex', label: 'Flex' },
              { value: 'grid', label: 'Grid' },
              { value: 'inline', label: 'Inline' },
              { value: 'inline-block', label: 'Inline Block' },
              { value: 'none', label: 'None' },
            ].map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Gap (px)</Label>
        <Input
          type="number"
          min={0}
          value={(overrides as any).gap ?? 0}
          onChange={(e) => setOverride('gap', Number(e.target.value))}
          className="h-7 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Flex Direction</Label>
        <Select
          value={(overrides as any).flexDirection ?? ''}
          onValueChange={(v) => setOverride('flexDirection', v || undefined)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Inherit" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: '', label: 'Inherit' },
              { value: 'row', label: 'Row' },
              { value: 'column', label: 'Column' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' },
            ].map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Justify Content
          </Label>
          <Select
            value={(overrides as any).justifyContent ?? ''}
            onValueChange={(v) => setOverride('justifyContent', v || undefined)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              {[
                '',
                'flex-start',
                'center',
                'flex-end',
                'space-between',
                'space-around',
                'space-evenly',
              ].map((o) => (
                <SelectItem key={o} value={o} className="text-xs">
                  {o || 'Inherit'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Align Items</Label>
          <Select
            value={(overrides as any).alignItems ?? ''}
            onValueChange={(v) => setOverride('alignItems', v || undefined)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              {[
                '',
                'stretch',
                'flex-start',
                'center',
                'flex-end',
                'baseline',
              ].map((o) => (
                <SelectItem key={o} value={o} className="text-xs">
                  {o || 'Inherit'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Position</Label>
        <Select
          value={(overrides as any).position ?? ''}
          onValueChange={(v) => setOverride('position', v || undefined)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Inherit" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: '', label: 'Inherit' },
              { value: 'static', label: 'Static' },
              { value: 'relative', label: 'Relative' },
              { value: 'absolute', label: 'Absolute' },
              { value: 'fixed', label: 'Fixed' },
              { value: 'sticky', label: 'Sticky' },
            ].map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {((overrides as any).position === 'absolute' ||
        (overrides as any).position === 'fixed') && (
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Top"
            value={(overrides as any).top ?? ''}
            onChange={(v) => setOverride('top', v)}
          />
          <StyleInput
            label="Right"
            value={(overrides as any).right ?? ''}
            onChange={(v) => setOverride('right', v)}
          />
          <StyleInput
            label="Bottom"
            value={(overrides as any).bottom ?? ''}
            onChange={(v) => setOverride('bottom', v)}
          />
          <StyleInput
            label="Left"
            value={(overrides as any).left ?? ''}
            onChange={(v) => setOverride('left', v)}
          />
        </div>
      )}
    </div>
  );
}

function SectionSettings({ section }: { section: Section }) {
  const sections = useBuilderStore((s) => s.sections);
  const setSections = useBuilderStore((s) => s.setSections);

  const settings = section.settings as Record<string, unknown>;

  const updateSetting = (key: string, value: unknown) => {
    const updated = sections.map((s) =>
      s.id === section.id
        ? { ...s, settings: { ...s.settings, [key]: value } }
        : s
    );
    setSections(updated);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={(settings.backgroundColor as string) ?? 'transparent'}
            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
            className="h-8 w-12"
          />
          <Input
            value={(settings.backgroundColor as string) ?? 'transparent'}
            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
            className="h-8 flex-1 text-xs font-mono"
          />
        </div>
      </div>
      <SpacingInput
        label="Padding"
        values={{
          paddingTop: (settings.paddingTop as number) ?? 0,
          paddingRight: (settings.paddingRight as number) ?? 0,
          paddingBottom: (settings.paddingBottom as number) ?? 0,
          paddingLeft: (settings.paddingLeft as number) ?? 0,
        }}
        onChange={(key, value) => updateSetting(key, value)}
      />
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Grid Columns</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={(settings.gridColumns as number) ?? 12}
          onChange={(e) => updateSetting('gridColumns', Number(e.target.value))}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Gap</Label>
        <Input
          type="number"
          min={0}
          value={(settings.gap as number) ?? 4}
          onChange={(e) => updateSetting('gap', Number(e.target.value))}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Max Width</Label>
        <Input
          type="number"
          min={0}
          value={(settings.maxWidth as number) ?? 1200}
          onChange={(e) => updateSetting('maxWidth', Number(e.target.value))}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Video URL
        </Label>
        <Input
          value={(settings.backgroundVideoUrl as string) ?? ''}
          onChange={(e) => updateSetting('backgroundVideoUrl', e.target.value)}
          className="h-8 text-xs font-mono"
          placeholder="https://example.com/video.mp4"
        />
        {settings.backgroundVideoUrl && (
          <video
            src={settings.backgroundVideoUrl as string}
            muted
            autoPlay
            loop
            playsInline
            className="mt-1 h-16 w-full rounded object-cover"
          />
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Collapse Section
        </Label>
        <Button
          variant={(settings as any).collapsed ? 'default' : 'outline'}
          size="sm"
          className="w-full text-xs"
          onClick={() =>
            updateSetting('collapsed', !(settings as any).collapsed)
          }
        >
          {(settings as any).collapsed ? 'Collapsed' : 'Expanded'}
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <p className="text-center text-sm text-muted-foreground">
        Select a block to edit its properties
      </p>
    </div>
  );
}

export function PropertyPanel() {
  const sections = useBuilderStore((s) => s.sections);
  const selection = useBuilderStore((s) => s.selection);

  const selectedBlock = useMemo(
    () => findSelectedBlock(sections, selection),
    [sections, selection]
  );
  const selectedSection = useMemo(
    () => findSelectedSection(sections, selection),
    [sections, selection]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">
          {selection?.type === 'section'
            ? 'Section Settings'
            : selection?.type === 'block'
              ? 'Block Properties'
              : 'Properties'}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!selection && <EmptyState />}
        {selection?.type === 'section' && selectedSection && (
          <SectionSettings section={selectedSection} />
        )}
        {selection?.type === 'block' && selectedBlock && (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1 text-xs">
                Content
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex-1 text-xs">
                Styles
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 text-xs">
                Advanced
              </TabsTrigger>
              <TabsTrigger value="responsive" className="flex-1 text-xs">
                Rsp.
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ContentTab
                block={selectedBlock.block}
                sectionId={selectedBlock.section.id}
                columnId={selectedBlock.columnId}
              />
            </TabsContent>
            <TabsContent value="styles">
              <StylesTab
                block={selectedBlock.block}
                sectionId={selectedBlock.section.id}
                columnId={selectedBlock.columnId}
              />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedTab
                block={selectedBlock.block}
                sectionId={selectedBlock.section.id}
                columnId={selectedBlock.columnId}
              />
            </TabsContent>
            <TabsContent value="responsive">
              <ResponsiveTab
                block={selectedBlock.block}
                sectionId={selectedBlock.section.id}
                columnId={selectedBlock.columnId}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
