import React, { useState, useCallback } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  Trash2,
  Copy,
} from 'lucide-react';
import { ColorPicker } from '../../../form-builder/src/components/ColorPicker';

export interface StyleControlsProps {
  onStyleChange: (styles: Record<string, any>) => void;
  currentStyles: Record<string, any>;
  type: 'spacing' | 'typography' | 'border' | 'shadow' | 'background';
}

export function SpacingControls({
  onStyleChange,
  currentStyles,
}: {
  onStyleChange: (s: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}) {
  const update = (key: string, value: any) =>
    onStyleChange({ ...currentStyles, [key]: value });

  return (
    <div className="space-y-3 p-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Padding
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {['Top', 'Right', 'Bottom', 'Left'].map((pos) => (
          <div key={pos}>
            <label className="text-[9px] text-muted-foreground block mb-0.5">
              {pos}
            </label>
            <input
              type="number"
              value={currentStyles[`padding-${pos.toLowerCase()}`] || 0}
              onChange={(e) =>
                update(`padding-${pos.toLowerCase()}`, `${e.target.value}px`)
              }
              className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
            />
          </div>
        ))}
      </div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase mt-2">
        Margin
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {['Top', 'Right', 'Bottom', 'Left'].map((pos) => (
          <div key={pos}>
            <label className="text-[9px] text-muted-foreground block mb-0.5">
              {pos}
            </label>
            <input
              type="number"
              value={currentStyles[`margin-${pos.toLowerCase()}`] || 0}
              onChange={(e) =>
                update(`margin-${pos.toLowerCase()}`, `${e.target.value}px`)
              }
              className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TypographyControls({
  onStyleChange,
  currentStyles,
}: {
  onStyleChange: (s: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}) {
  const update = (key: string, value: any) =>
    onStyleChange({ ...currentStyles, [key]: value });

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-2">
        <Type size={14} />
        <select
          value={currentStyles.fontFamily || ''}
          onChange={(e) => update('fontFamily', e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-muted border border-border rounded"
        >
          <option value="">Default</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">Size</label>
          <input
            type="number"
            value={parseInt(currentStyles.fontSize) || 16}
            onChange={(e) => update('fontSize', `${e.target.value}px`)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Weight
          </label>
          <select
            value={currentStyles.fontWeight || '400'}
            onChange={(e) => update('fontWeight', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          >
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Line Height
          </label>
          <input
            type="number"
            step="0.1"
            value={currentStyles.lineHeight || 1.5}
            onChange={(e) => update('lineHeight', parseFloat(e.target.value))}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Letter Spacing
          </label>
          <input
            type="number"
            step="0.5"
            value={parseFloat(currentStyles.letterSpacing) || 0}
            onChange={(e) => update('letterSpacing', `${e.target.value}px`)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => update('textAlign', 'left')}
          className={`p-1.5 rounded ${currentStyles.textAlign === 'left' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <AlignLeft size={14} />
        </button>
        <button
          onClick={() => update('textAlign', 'center')}
          className={`p-1.5 rounded ${currentStyles.textAlign === 'center' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <AlignCenter size={14} />
        </button>
        <button
          onClick={() => update('textAlign', 'right')}
          className={`p-1.5 rounded ${currentStyles.textAlign === 'right' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <AlignRight size={14} />
        </button>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() =>
            update(
              'fontWeight',
              currentStyles.fontWeight === '700' ? '400' : '700'
            )
          }
          className={`p-1.5 rounded ${currentStyles.fontWeight === '700' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() =>
            update(
              'fontStyle',
              currentStyles.fontStyle === 'italic' ? 'normal' : 'italic'
            )
          }
          className={`p-1.5 rounded ${currentStyles.fontStyle === 'italic' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() =>
            update(
              'textDecoration',
              currentStyles.textDecoration === 'underline'
                ? 'none'
                : 'underline'
            )
          }
          className={`p-1.5 rounded ${currentStyles.textDecoration === 'underline' ? 'bg-accent' : 'hover:bg-accent'}`}
        >
          <Underline size={14} />
        </button>
      </div>
    </div>
  );
}

export function BorderControls({
  onStyleChange,
  currentStyles,
}: {
  onStyleChange: (s: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}) {
  const update = (key: string, value: any) =>
    onStyleChange({ ...currentStyles, [key]: value });

  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Width
          </label>
          <input
            type="number"
            value={parseInt(currentStyles.borderWidth) || 0}
            onChange={(e) => update('borderWidth', `${e.target.value}px`)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Style
          </label>
          <select
            value={currentStyles.borderStyle || 'solid'}
            onChange={(e) => update('borderStyle', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Radius
          </label>
          <input
            type="number"
            value={parseInt(currentStyles.borderRadius) || 0}
            onChange={(e) => update('borderRadius', `${e.target.value}px`)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
      </div>
      <div>
        <label className="text-[9px] text-muted-foreground block mb-1">
          Color
        </label>
        <ColorPicker
          value={currentStyles.borderColor || '#000000'}
          onChange={(color) => update('borderColor', color)}
        />
      </div>
    </div>
  );
}

export function ShadowControls({
  onStyleChange,
  currentStyles,
}: {
  onStyleChange: (s: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}) {
  const update = (key: string, value: any) =>
    onStyleChange({ ...currentStyles, [key]: value });

  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">
            X Offset
          </label>
          <input
            type="number"
            value={currentStyles.shadowX || 0}
            onChange={(e) => update('shadowX', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Y Offset
          </label>
          <input
            type="number"
            value={currentStyles.shadowY || 0}
            onChange={(e) => update('shadowY', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">Blur</label>
          <input
            type="number"
            value={currentStyles.shadowBlur || 0}
            onChange={(e) => update('shadowBlur', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Spread
          </label>
          <input
            type="number"
            value={currentStyles.shadowSpread || 0}
            onChange={(e) => update('shadowSpread', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          />
        </div>
      </div>
      <div>
        <label className="text-[9px] text-muted-foreground block mb-1">
          Color
        </label>
        <ColorPicker
          value={currentStyles.shadowColor || 'rgba(0,0,0,0.1)'}
          onChange={(color) => update('shadowColor', color)}
        />
      </div>
    </div>
  );
}

export function BackgroundControls({
  onStyleChange,
  currentStyles,
}: {
  onStyleChange: (s: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}) {
  const update = (key: string, value: any) =>
    onStyleChange({ ...currentStyles, [key]: value });

  return (
    <div className="space-y-3 p-3">
      <div>
        <label className="text-[9px] text-muted-foreground block mb-1">
          Background Color
        </label>
        <ColorPicker
          value={currentStyles.backgroundColor || '#ffffff'}
          onChange={(color) => update('backgroundColor', color)}
        />
      </div>
      <div>
        <label className="text-[9px] text-muted-foreground block mb-1">
          Background Image URL
        </label>
        <input
          type="text"
          value={currentStyles.backgroundImage || ''}
          onChange={(e) => update('backgroundImage', `url(${e.target.value})`)}
          placeholder="https://..."
          className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-muted-foreground block">Size</label>
          <select
            value={currentStyles.backgroundSize || 'cover'}
            onChange={(e) => update('backgroundSize', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground block">
            Repeat
          </label>
          <select
            value={currentStyles.backgroundRepeat || 'no-repeat'}
            onChange={(e) => update('backgroundRepeat', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[9px] text-muted-foreground block mb-1">
          Position
        </label>
        <select
          value={currentStyles.backgroundPosition || 'center'}
          onChange={(e) => update('backgroundPosition', e.target.value)}
          className="w-full px-2 py-1 text-xs bg-muted border border-border rounded"
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}
