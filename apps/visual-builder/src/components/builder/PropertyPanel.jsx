import React from 'react';
import { Type, Image, Move, Square, PaintBucket, Layers, Hash, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

const typeLabels = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  button: 'Button',
  image: 'Image',
  Container: 'Container',
  group: 'Group',
};

const PropertySection = ({ label, children }) => (
  <div className="border-b border-border pb-3 mb-3">
    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">{label}</span>
    {children}
  </div>
);

const PropRow = ({ label, children }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-xs text-text-secondary w-16 shrink-0">{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const Input = ({ value, onChange, ...props }) => (
  <input value={value} onChange={onChange} className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary" {...props} />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const ColorInput = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    <input type="color" value={value || '#000000'} onChange={onChange} className="w-6 h-6 p-0 border border-border rounded cursor-pointer" />
    <input value={value || ''} onChange={onChange} placeholder="#000" className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary" />
  </div>
);

export default function PropertyPanel({ selectedComponent, onUpdate }) {
  if (!selectedComponent) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-text-secondary">
        <Square className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs text-center">Select a component to edit its properties</p>
      </div>
    );
  }

  const type = selectedComponent.type || 'div';
  const props = selectedComponent.props || {};
  const position = selectedComponent.position || { x: 0, y: 0 };
  const size = selectedComponent.size || { width: 200, height: 100 };

  const update = (path, value) => {
    if (path.startsWith('props.')) {
      const key = path.slice(6);
      onUpdate({ props: { ...props, [key]: value } });
    } else if (path === 'position.x') {
      onUpdate({ position: { ...position, x: Number(value) } });
    } else if (path === 'position.y') {
      onUpdate({ position: { ...position, y: Number(value) } });
    } else if (path === 'size.width') {
      onUpdate({ size: { ...size, width: Number(value) } });
    } else if (path === 'size.height') {
      onUpdate({ size: { ...size, height: Number(value) } });
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <span className="text-xs font-medium bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded">{typeLabels[type] || type}</span>
        <span className="text-xs text-text-secondary">{selectedComponent.id}</span>
      </div>

      <PropertySection label="Position & Size">
        <div className="grid grid-cols-2 gap-2">
          <PropRow label="X">
            <Input type="number" value={position.x} onChange={e => update('position.x', e.target.value)} />
          </PropRow>
          <PropRow label="Y">
            <Input type="number" value={position.y} onChange={e => update('position.y', e.target.value)} />
          </PropRow>
          <PropRow label="W">
            <Input type="number" value={size.width} onChange={e => update('size.width', e.target.value)} min="20" />
          </PropRow>
          <PropRow label="H">
            <Input type="number" value={size.height} onChange={e => update('size.height', e.target.value)} min="20" />
          </PropRow>
        </div>
      </PropertySection>

      {(type === 'heading' || type === 'paragraph' || type === 'Text') && (
        <PropertySection label="Content">
          <PropRow label="Text">
            <textarea
              value={props.text || ''}
              onChange={e => update('props.text', e.target.value)}
              rows={3}
              className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary resize-none"
            />
          </PropRow>
          {type === 'heading' && (
            <PropRow label="Level">
              <Select
                value={props.level || 'h1'}
                onChange={e => update('props.level', e.target.value)}
                options={[
                  { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' },
                  { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' },
                  { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' },
                ]}
              />
            </PropRow>
          )}
        </PropertySection>
      )}

      {type === 'button' && (
        <PropertySection label="Content">
          <PropRow label="Text">
            <Input value={props.text || 'Button'} onChange={e => update('props.text', e.target.value)} />
          </PropRow>
          <PropRow label="Variant">
            <Select
              value={props.variant || 'primary'}
              onChange={e => update('props.variant', e.target.value)}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' },
              ]}
            />
          </PropRow>
        </PropertySection>
      )}

      {type === 'image' && (
        <PropertySection label="Image">
          <PropRow label="Source">
            <Input value={props.src || ''} onChange={e => update('props.src', e.target.value)} placeholder="https://..." />
          </PropRow>
          <PropRow label="Alt text">
            <Input value={props.alt || ''} onChange={e => update('props.alt', e.target.value)} />
          </PropRow>
          <PropRow label="Fit">
            <Select
              value={props.objectFit || 'cover'}
              onChange={e => update('props.objectFit', e.target.value)}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
                { value: 'none', label: 'None' },
              ]}
            />
          </PropRow>
        </PropertySection>
      )}

      <PropertySection label="Typography">
        <PropRow label="Size">
          <Input type="number" value={props.fontSize || ''} onChange={e => update('props.fontSize', e.target.value)} placeholder="16" />
        </PropRow>
        <PropRow label="Color">
          <ColorInput value={props.color || ''} onChange={e => update('props.color', e.target.value)} />
        </PropRow>
        <PropRow label="Align">
          <div className="flex gap-1">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => update('props.align', value)}
                className={`p-1 rounded ${props.align === value ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:bg-surface-light'}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </PropRow>
      </PropertySection>

      <PropertySection label="Style">
        <PropRow label="Background">
          <ColorInput value={props.backgroundColor || ''} onChange={e => update('props.backgroundColor', e.target.value)} />
        </PropRow>
        <PropRow label="Text color">
          <ColorInput value={props.textColor || ''} onChange={e => update('props.textColor', e.target.value)} />
        </PropRow>
        <PropRow label="Padding">
          <Input type="number" value={props.padding || ''} onChange={e => update('props.padding', e.target.value)} placeholder="16" />
        </PropRow>
        <PropRow label="Radius">
          <Input type="number" value={props.borderRadius || ''} onChange={e => update('props.borderRadius', e.target.value)} placeholder="0" />
        </PropRow>
        <PropRow label="Shadow">
          <Select
            value={props.shadow || 'none'}
            onChange={e => update('props.shadow', e.target.value)}
            options={[
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ]}
          />
        </PropRow>
        <PropRow label="Opacity">
          <input
            type="range"
            min="0"
            max="100"
            value={props.opacity ?? 100}
            onChange={e => update('props.opacity', Number(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-text-secondary w-8 text-right">{props.opacity ?? 100}%</span>
        </PropRow>
      </PropertySection>

      <PropertySection label="Advanced">
        <PropRow label="Z-index">
          <Input type="number" value={props.zIndex || ''} onChange={e => update('props.zIndex', e.target.value)} />
        </PropRow>
        <PropRow label="Class">
          <Input value={props.className || ''} onChange={e => update('props.className', e.target.value)} placeholder="custom-class" />
        </PropRow>
      </PropertySection>
    </div>
  );
}
