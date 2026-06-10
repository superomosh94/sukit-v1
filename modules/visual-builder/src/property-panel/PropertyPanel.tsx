'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useBuilderStore } from '../stores/builderStore';
import { blockRegistry } from '../block-registry';
import type { Block, Section, DeviceViewport } from '../types';
import { cn } from '../utils/cn';
import { TextBlockEditor } from './editors/TextBlockEditor';
import { ImageBlockEditor } from './editors/ImageBlockEditor';
import { ButtonBlockEditor } from './editors/ButtonBlockEditor';
import { VideoBlockEditor } from './editors/VideoBlockEditor';
import { EnterAnimationPicker } from './editors/EnterAnimationPicker';
import { HoverEffectPicker } from './editors/HoverEffectPicker';
import { ColorSwatchPicker } from './editors/ColorSwatchPicker';
import { GradientPicker } from './editors/GradientPicker';
import { MediaBrowser } from './editors/MediaBrowser';
import { showToast } from '../components/Toast';
import { PageSettingsEditor } from '../components/PageSettingsEditor';

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
      if (!registration) {
        return (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No editable properties for this block
          </p>
        );
      }

      // Use custom editor if provided
      if (registration.EditorComponent) {
        return (
          <registration.EditorComponent block={block} onChange={handleChange} />
        );
      }

      // Show block template selector if templates exist
      const blockTemplates = registration.templates;
      const hasTemplates =
        blockTemplates && Object.keys(blockTemplates).length > 0;

      return (
        <div className="space-y-3">
          {hasTemplates && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select
                value=""
                onValueChange={(templateKey) => {
                  if (templateKey && blockTemplates?.[templateKey]) {
                    const tmpl = blockTemplates[templateKey];
                    handleChange({
                      props: { ...block.props, ...tmpl.props },
                      styles: { ...block.styles, ...tmpl.styles },
                    });
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(blockTemplates).map(([key, tmpl]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fallback: generic prop editor from schema */}
          {!registration.schema ||
          Object.keys(registration.schema).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No editable properties for this block
            </p>
          ) : (
            (() => {
              const schemaEntries = Object.entries(registration.schema);
              const groups = new Map<string, typeof schemaEntries>();
              const ungrouped: typeof schemaEntries = [];

              for (const entry of schemaEntries) {
                const [, propSchema] = entry;
                if (propSchema.group) {
                  const existing = groups.get(propSchema.group) ?? [];
                  existing.push(entry);
                  groups.set(propSchema.group, existing);
                } else {
                  ungrouped.push(entry);
                }
              }

              const renderProp = ([
                key,
                propSchema,
              ]: (typeof schemaEntries)[0]) => {
                const value =
                  (block.props as Record<string, unknown>)[key] ?? '';
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs capitalize text-muted-foreground">
                      {propSchema.label ??
                        key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    {propSchema.type === 'select' && propSchema.options ? (
                      <select
                        value={String(value)}
                        onChange={(e) =>
                          handleChange({
                            props: { ...block.props, [key]: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs"
                      >
                        {!propSchema.required && (
                          <option value="">Select...</option>
                        )}
                        {propSchema.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : propSchema.type === 'number' ? (
                      <Input
                        type="number"
                        value={value as number}
                        onChange={(e) =>
                          handleChange({
                            props: {
                              ...block.props,
                              [key]: Number(e.target.value),
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                    ) : (propSchema.type as string) === 'textarea' ? (
                      <textarea
                        value={String(value)}
                        onChange={(e) =>
                          handleChange({
                            props: { ...block.props, [key]: e.target.value },
                          })
                        }
                        className="h-20 w-full rounded-md border border-input bg-background p-2 text-xs"
                      />
                    ) : propSchema.type === 'boolean' ? (
                      <Button
                        type="button"
                        variant={value ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-full text-xs"
                        onClick={() =>
                          handleChange({
                            props: { ...block.props, [key]: !value },
                          })
                        }
                      >
                        {value ? 'Yes' : 'No'}
                      </Button>
                    ) : propSchema.type === 'color' ? (
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={String(value || '#000000')}
                          onChange={(e) =>
                            handleChange({
                              props: { ...block.props, [key]: e.target.value },
                            })
                          }
                          className="h-8 w-12"
                        />
                        <Input
                          value={String(value || '')}
                          onChange={(e) =>
                            handleChange({
                              props: { ...block.props, [key]: e.target.value },
                            })
                          }
                          className="h-8 flex-1 text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <Input
                        value={String(value)}
                        onChange={(e) =>
                          handleChange({
                            props: { ...block.props, [key]: e.target.value },
                          })
                        }
                        className="h-8 text-xs"
                        placeholder={
                          propSchema.placeholder ??
                          (propSchema.default != null
                            ? String(propSchema.default)
                            : '')
                        }
                      />
                    )}
                  </div>
                );
              };

              return (
                <>
                  {ungrouped.map(renderProp)}
                  {Array.from(groups.entries()).map(([groupName, entries]) => (
                    <div
                      key={groupName}
                      className="space-y-1 border-t border-border/50 pt-2"
                    >
                      <Label className="text-[10px] font-medium uppercase text-muted-foreground">
                        {groupName}
                      </Label>
                      {entries.map(renderProp)}
                    </div>
                  ))}
                </>
              );
            })()
          )}
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
  const presets = [0, 4, 8, 12, 16, 24, 32, 48, 64];

  const applyPreset = (val: number) => {
    const dirs = ['Top', 'Right', 'Bottom', 'Left'];
    dirs.forEach((dir) => {
      const key = `${label.toLowerCase()}${dir}`;
      onChange(key, val);
    });
  };

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
      <div className="flex flex-wrap gap-1 pt-1">
        {presets.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => applyPreset(val)}
            className="rounded border px-1.5 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {val === 0 ? '0' : `${val}px`}
          </button>
        ))}
      </div>
    </div>
  );
}

const FONT_FAMILIES = [
  'Inter',
  'System UI',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'Courier New',
  'monospace',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
];

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
  const debouncedUpdate = useRef(
    debounce((key: string, value: string | number) => {
      updateBlock(sectionId, columnId, block.id, {
        styles: { ...block.styles, [key]: value },
      });
    }, 150)
  ).current;

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
    debouncedUpdate(key, value);
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
          <Select
            value={(styles.fontFamily as string) || 'Inter'}
            onValueChange={(v) => updateStyle('fontFamily', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="bg image URL"
              value={(styles.backgroundImage as string) ?? ''}
              onChange={(e) => updateStyle('backgroundImage', e.target.value)}
              className="h-8 text-xs"
            />
            {!styles.backgroundImage && (
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Enter background image URL:');
                  if (url) updateStyle('backgroundImage', url);
                }}
                className="text-[10px] text-primary hover:underline"
              >
                Browse Media
              </button>
            )}
          </div>
        </div>
        {(styles.backgroundGradient as string) ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Gradient
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = { ...styles };
                  delete next.backgroundGradient;
                  Object.assign(styles, next);
                  updateStyle('backgroundGradient', '');
                }}
                className="text-[10px] text-destructive hover:underline"
              >
                Remove
              </button>
            </div>
            <div
              className="h-6 w-full rounded border"
              style={{ background: styles.backgroundGradient as string }}
            />
          </div>
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
            + Add gradient background
          </button>
        )}
        {styles.backgroundGradient && (
          <GradientPicker
            value={styles.backgroundGradient as string}
            onChange={(v) => updateStyle('backgroundGradient', v)}
          />
        )}
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
        <div className="flex flex-wrap gap-1 pt-1">
          {[
            'container',
            'wrapper',
            'hero',
            'card',
            'card-body',
            'card-header',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'gap-2',
            'gap-4',
            'text-center',
            'text-lg',
            'font-bold',
            'text-muted',
            'bg-muted',
            'rounded',
            'shadow',
            'p-4',
            'p-8',
            'm-0',
            'w-full',
            'max-w-lg',
            'mx-auto',
          ].map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => {
                const current = (props.cssClass as string) ?? '';
                const classes = current.split(' ').filter(Boolean);
                if (!classes.includes(cls)) {
                  classes.push(cls);
                  handleChange({
                    props: { ...block.props, cssClass: classes.join(' ') },
                  });
                }
              }}
              className="rounded border px-1 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              .{cls}
            </button>
          ))}
        </div>
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

function AnimationTab({
  block,
  sectionId,
  columnId,
}: {
  block: Block;
  sectionId: string;
  columnId: string;
}) {
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  return (
    <div className="space-y-3">
      <EnterAnimationPicker
        animation={block.animation}
        onChange={(animation) =>
          updateBlock(sectionId, columnId, block.id, { animation })
        }
      />
      <div className="border-t border-border/50 pt-3">
        <Label className="mb-2 block text-xs font-medium text-muted-foreground">
          Hover Effect
        </Label>
        <HoverEffectPicker
          effect={{
            cssPreset: (block.props.hoverEffect as string) ?? 'none',
            shaderPreset: (block.props.shaderPreset as string) ?? 'none',
            speed: (block.props.hoverSpeed as number) ?? 1,
            smoothness: (block.props.hoverSmoothness as number) ?? 0.5,
          }}
          onChange={(effect) =>
            updateBlock(sectionId, columnId, block.id, {
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
    </div>
  );
}

function ColumnSettings({
  section,
  columnId,
}: {
  section: Section;
  columnId: string;
}) {
  const setColumnSpan = useBuilderStore((s) => s.setColumnSpan);
  const column = section.columns.find((c) => c.id === columnId);
  if (!column) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        Select a column
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Column Span</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={12}
            value={column.span}
            onChange={(e) =>
              setColumnSpan(section.id, columnId, Number(e.target.value))
            }
            className="h-8 w-16 text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">/ 12 columns</span>
        </div>
        <div className="flex gap-1 pt-1">
          {[1, 2, 3, 4, 6, 8, 12].map((s) => (
            <button
              key={s}
              onClick={() => setColumnSpan(section.id, columnId, s)}
              className={`h-6 w-6 rounded text-[10px] font-medium transition-colors ${
                column.span === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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

  const bgGradient =
    overrides.backgroundGradient ?? block.styles.backgroundGradient ?? '';

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
          value={
            (overrides as any).display ?? (block.styles.display as string) ?? ''
          }
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
        <Label className="text-xs text-muted-foreground">
          Border Width (px)
        </Label>
        <Input
          type="number"
          min={0}
          value={
            (overrides as any).borderWidth ??
            (block.styles.borderWidth as number) ??
            0
          }
          onChange={(e) => setOverride('borderWidth', Number(e.target.value))}
          className="h-7 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Border Radius (px)
        </Label>
        <Input
          type="number"
          min={0}
          value={
            (overrides as any).borderRadius ??
            (block.styles.borderRadius as number) ??
            0
          }
          onChange={(e) => setOverride('borderRadius', Number(e.target.value))}
          className="h-7 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Gap (px)</Label>
        <Input
          type="number"
          min={0}
          value={(overrides as any).gap ?? (block.styles.gap as number) ?? 0}
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

      {(overrides as any).position === 'absolute' ||
      (overrides as any).position === 'fixed' ? (
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
      ) : null}

      {bgGradient && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Background Gradient
          </Label>
          <div
            className="h-6 w-full rounded border"
            style={{ background: bgGradient as string }}
          />
          <GradientPicker
            value={bgGradient as string}
            onChange={(v) => setOverride('backgroundGradient', v)}
          />
        </div>
      )}
    </div>
  );
}

function SectionSettings({ section }: { section: Section }) {
  const sections = useBuilderStore((s) => s.sections);
  const setSections = useBuilderStore((s) => s.setSections);
  const setColumnSpan = useBuilderStore((s) => s.setColumnSpan);
  const setSectionVisibility = useBuilderStore((s) => s.setSectionVisibility);
  const viewport = useBuilderStore((s) => s.viewport);

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

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Image URL
        </Label>
        <Input
          value={(settings.backgroundImage as string) ?? ''}
          onChange={(e) => updateSetting('backgroundImage', e.target.value)}
          className="h-8 text-xs font-mono"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Video URL
        </Label>
        <div className="flex gap-1">
          <Input
            value={(settings.backgroundVideoUrl as string) ?? ''}
            onChange={(e) =>
              updateSetting('backgroundVideoUrl', e.target.value)
            }
            className="h-8 flex-1 text-xs font-mono"
            placeholder="https://example.com/video.mp4"
          />
          {(settings.backgroundVideoUrl as string) && (
            <button
              onClick={() => updateSetting('backgroundVideoUrl', '')}
              className="size-8 shrink-0 rounded-md border text-xs text-destructive hover:bg-destructive/10"
              title="Remove video"
            >
              ×
            </button>
          )}
        </div>
        {(settings.backgroundVideoUrl as string) && (
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
        <p className="text-[10px] text-muted-foreground">
          Collapsed sections are hidden in the editor and export
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Background Size</Label>
        <Select
          value={(settings.backgroundSize as string) ?? 'cover'}
          onValueChange={(v) => updateSetting('backgroundSize', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['cover', 'contain', 'auto', '100% 100%'].map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Background Attachment
        </Label>
        <Select
          value={(settings.backgroundAttachment as string) ?? 'scroll'}
          onValueChange={(v) => updateSetting('backgroundAttachment', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['scroll', 'fixed', 'local'].map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Label className="text-xs text-muted-foreground">Min Height</Label>
        <Input
          type="number"
          min={0}
          value={(settings.minHeight as number) ?? 0}
          onChange={(e) => updateSetting('minHeight', Number(e.target.value))}
          className="h-8 text-xs"
          placeholder="0 (auto)"
        />
      </div>

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

      {section.columns.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Column Spans</Label>
          {section.columns.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">
                Col {idx + 1}
              </span>
              <Input
                type="number"
                min={1}
                max={12}
                value={col.span}
                onChange={(e) =>
                  setColumnSpan(section.id, col.id, Number(e.target.value))
                }
                className="h-7 w-14 text-xs text-center"
              />
              <span className="text-[10px] text-muted-foreground">/12</span>
            </div>
          ))}
        </div>
      )}

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

      {viewport !== 'desktop' && (
        <div className="space-y-1 border-t border-border/50 pt-3">
          <Label className="text-xs text-muted-foreground">
            Hide on {viewport}
          </Label>
          <Button
            variant={
              (section.responsive[viewport] as Record<string, unknown>)?.hidden
                ? 'default'
                : 'outline'
            }
            size="sm"
            className="w-full text-xs"
            onClick={() =>
              setSectionVisibility(
                section.id,
                viewport,
                !(section.responsive[viewport] as Record<string, unknown>)
                  ?.hidden
              )
            }
          >
            {(section.responsive[viewport] as Record<string, unknown>)?.hidden
              ? 'Hidden'
              : 'Visible'}
          </Button>
        </div>
      )}
    </div>
  );
}

function LayoutTab({
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

  const debouncedUpdate = useRef(
    debounce((key: string, value: string | number) => {
      updateBlock(sectionId, columnId, block.id, {
        styles: { ...block.styles, [key]: value },
      });
    }, 150)
  ).current;

  const updateStyle = (key: string, value: string | number) => {
    debouncedUpdate(key, value);
  };

  const display = (styles.display as string) ?? 'block';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Dimensions</Label>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Width"
            value={(styles.width as string | number) ?? 'auto'}
            onChange={(v) => updateStyle('width', v)}
          />
          <StyleInput
            label="Height"
            value={(styles.height as string | number) ?? 'auto'}
            onChange={(v) => updateStyle('height', v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Min Width"
            type="number"
            value={(styles.minWidth as number) ?? 0}
            onChange={(v) => updateStyle('minWidth', v)}
          />
          <StyleInput
            label="Min Height"
            type="number"
            value={(styles.minHeight as number) ?? 0}
            onChange={(v) => updateStyle('minHeight', v)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Display</Label>
        <Select
          value={display}
          onValueChange={(v) => updateStyle('display', v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['block', 'flex', 'grid', 'inline', 'inline-block', 'none'].map(
              (v) => (
                <SelectItem key={v} value={v} className="text-xs">
                  {v}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {display === 'flex' && (
        <div className="space-y-2 rounded-md border p-2">
          <Label className="text-xs font-medium">Flexbox</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Direction
              </Label>
              <Select
                value={(styles.flexDirection as string) ?? 'row'}
                onValueChange={(v) => updateStyle('flexDirection', v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['row', 'row-reverse', 'column', 'column-reverse'].map(
                    (v) => (
                      <SelectItem key={v} value={v} className="text-xs">
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Wrap</Label>
              <Select
                value={(styles.flexWrap as string) ?? 'nowrap'}
                onValueChange={(v) => updateStyle('flexWrap', v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['nowrap', 'wrap', 'wrap-reverse'].map((v) => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Justify
              </Label>
              <Select
                value={(styles.justifyContent as string) ?? 'flex-start'}
                onValueChange={(v) => updateStyle('justifyContent', v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'flex-start',
                    'center',
                    'flex-end',
                    'space-between',
                    'space-around',
                    'space-evenly',
                  ].map((v) => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Align</Label>
              <Select
                value={(styles.alignItems as string) ?? 'stretch'}
                onValueChange={(v) => updateStyle('alignItems', v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'stretch',
                    'flex-start',
                    'center',
                    'flex-end',
                    'baseline',
                  ].map((v) => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <StyleInput
            label="Gap (px)"
            type="number"
            value={(styles.gap as number) ?? 0}
            onChange={(v) => updateStyle('gap', v)}
          />
        </div>
      )}

      {display === 'grid' && (
        <div className="space-y-2 rounded-md border p-2">
          <Label className="text-xs font-medium">Grid</Label>
          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Columns"
              value={(styles.gridTemplateColumns as string) ?? '1fr'}
              onChange={(v) => updateStyle('gridTemplateColumns', v)}
            />
            <StyleInput
              label="Rows"
              value={(styles.gridTemplateRows as string) ?? 'auto'}
              onChange={(v) => updateStyle('gridTemplateRows', v)}
            />
          </div>
          <StyleInput
            label="Gap (px)"
            type="number"
            value={(styles.gap as number) ?? 0}
            onChange={(v) => updateStyle('gap', v)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-medium">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={(styles.position as string) ?? 'relative'}
            onValueChange={(v) => updateStyle('position', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['static', 'relative', 'absolute', 'fixed', 'sticky'].map(
                (v) => (
                  <SelectItem key={v} value={v} className="text-xs">
                    {v}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <StyleInput
            label="Z-Index"
            type="number"
            value={(styles.zIndex as number) ?? 0}
            onChange={(v) => updateStyle('zIndex', v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Top"
            type="number"
            value={(styles.top as number) ?? 0}
            onChange={(v) => updateStyle('top', v)}
          />
          <StyleInput
            label="Right"
            type="number"
            value={(styles.right as number) ?? 0}
            onChange={(v) => updateStyle('right', v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput
            label="Bottom"
            type="number"
            value={(styles.bottom as number) ?? 0}
            onChange={(v) => updateStyle('bottom', v)}
          />
          <StyleInput
            label="Left"
            type="number"
            value={(styles.left as number) ?? 0}
            onChange={(v) => updateStyle('left', v)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Overflow</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={(styles.overflow as string) ?? 'visible'}
            onValueChange={(v) => updateStyle('overflow', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['visible', 'hidden', 'scroll', 'auto'].map((v) => (
                <SelectItem key={v} value={v} className="text-xs">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

function BreakpointsEditor() {
  const customBreakpoints = useBuilderStore((s) => s.customBreakpoints);
  const setCustomBreakpoints = useBuilderStore((s) => s.setCustomBreakpoints);

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Custom Breakpoints (px)</Label>
      {Object.entries(customBreakpoints).map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-16 text-xs capitalize text-muted-foreground">
            {key}
          </span>
          <Input
            type="number"
            min={320}
            max={2560}
            value={val}
            onChange={(e) => {
              const next = {
                ...customBreakpoints,
                [key]: Number(e.target.value),
              };
              setCustomBreakpoints(next);
            }}
            className="h-8 flex-1 text-xs"
          />
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">
        Add or remove breakpoints through the store API
      </p>
    </div>
  );
}

function TemplateLibraryPanel() {
  const templates = useBuilderStore((s) => s.templates);
  const sections = useBuilderStore((s) => s.sections);
  const pageSettings = useBuilderStore((s) => s.pageSettings);
  const saveCurrentAsTemplate = useBuilderStore((s) => s.saveCurrentAsTemplate);
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);
  const deleteTemplate = useBuilderStore((s) => s.deleteTemplate);
  const addTemplateCategory = useBuilderStore((s) => s.addTemplateCategory);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const handleExport = async () => {
    const { compressForExport } = await import('../serializer');
    const json = compressForExport({ sections, pageSettings });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const { decompressImport } = await import('../serializer');
      const result = decompressImport(text);
      if (result) {
        saveCurrentAsTemplate(file.name.replace(/\.json$/, ''));
        showToast('Template imported', 'success');
      } else {
        showToast('Invalid template file', 'error');
      }
    };
    input.click();
  };

  const filteredTemplates =
    filterCat === 'All'
      ? templates
      : templates.filter((t) => t.category === filterCat);

  const categories = Array.from(
    new Set(templates.map((t) => t.category).filter(Boolean))
  );

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Save Current as Template</Label>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name..."
          className="h-8 flex-1 text-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {[
              '',
              'hero',
              'features',
              'pricing',
              'contact',
              'footer',
              'header',
              'content',
            ].map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c || 'None'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-8 text-xs shrink-0"
          disabled={!name.trim()}
          onClick={() => {
            saveCurrentAsTemplate(name.trim(), category || undefined);
            showToast('Template saved', 'success');
            setName('');
            setCategory('');
          }}
        >
          Save
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] flex-1"
          onClick={handleExport}
        >
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] flex-1"
          onClick={handleImport}
        >
          Import JSON
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-1 overflow-x-auto">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c as string)}
              className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                filterCat === c
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No saved templates
        </p>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              {t.thumbnailUrl && (
                <img
                  src={t.thumbnailUrl}
                  alt=""
                  className="size-8 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium">{t.name}</p>
                {t.category && (
                  <p className="text-[10px] text-muted-foreground">
                    {t.category}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => loadTemplate(t.id)}
              >
                Load
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-destructive"
                onClick={() => {
                  deleteTemplate(t.id);
                  showToast('Template deleted', 'info');
                }}
              >
                Del
              </Button>
            </div>
          ))}
        </div>
      )}
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

  const panelTitle = useMemo(() => {
    if (!selection) return 'Properties';
    if (selection.type === 'section') return 'Section Settings';
    if (selection.type === 'column') return 'Column Settings';
    return 'Block Properties';
  }, [selection]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">{panelTitle}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!selection && (
          <div className="space-y-6">
            <EmptyState />
            <BreakpointsEditor />
            <PageSettingsEditor />
          </div>
        )}
        {selection?.type === 'section' && selectedSection && (
          <SectionSettings section={selectedSection} />
        )}
        {selection?.type === 'column' && selectedSection && (
          <ColumnSettings section={selectedSection} columnId={selection.id} />
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
              <TabsTrigger value="layout" className="flex-1 text-xs">
                Layout
              </TabsTrigger>
              <TabsTrigger value="animation" className="flex-1 text-xs">
                Anim
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 text-xs">
                Adv.
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
            <TabsContent value="layout">
              <LayoutTab
                block={selectedBlock.block}
                sectionId={selectedBlock.section.id}
                columnId={selectedBlock.columnId}
              />
            </TabsContent>
            <TabsContent value="animation">
              <AnimationTab
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
