import React, { useState } from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';

const renderComponent = (comp) => {
  if (!comp) return null;
  const type = comp.type || 'div';
  const props = comp.props || {};
  const position = comp.position || { x: 0, y: 0 };
  const size = comp.size || { width: 200, height: 100 };

  const commonStyle = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    minHeight: size.height,
    backgroundColor: props.backgroundColor || undefined,
    opacity: (props.opacity ?? 100) / 100,
    zIndex: props.zIndex || undefined,
    borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
    padding: props.padding ? `${props.padding}px` : undefined,
    boxShadow: props.shadow && props.shadow !== 'none' ? `0 ${props.shadow === 'sm' ? '1px 2px' : props.shadow === 'md' ? '4px 6px' : '10px 15px'} rgba(0,0,0,0.1)` : undefined,
  };

  const textStyle = {
    fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
    color: props.color || props.textColor || undefined,
    textAlign: props.align || undefined,
    fontWeight: props.fontWeight || undefined,
  };

  switch (type) {
    case 'heading': {
      const level = props.level || 'h1';
      const Tag = level;
      return React.createElement(Tag, {
        key: comp.id,
        style: { ...commonStyle, ...textStyle, margin: 0 },
        className: props.className,
      }, props.text || 'Heading');
    }
    case 'paragraph':
      return (
        <p key={comp.id} style={{ ...commonStyle, ...textStyle, margin: 0 }} className={props.className}>
          {props.text || 'Paragraph'}
        </p>
      );
    case 'button': {
      const variantStyles = {
        primary: { backgroundColor: '#3B82F6', color: '#fff', border: 'none' },
        secondary: { backgroundColor: '#64748B', color: '#fff', border: 'none' },
        outline: { backgroundColor: 'transparent', color: '#3B82F6', border: '1px solid #3B82F6' },
        ghost: { backgroundColor: 'transparent', color: '#3B82F6', border: 'none' },
      };
      return (
        <button
          key={comp.id}
          style={{ ...commonStyle, ...variantStyles[props.variant] || variantStyles.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className={props.className}
        >
          {props.text || 'Button'}
        </button>
      );
    }
    case 'image':
      return (
        <div key={comp.id} style={{ ...commonStyle, overflow: 'hidden' }}>
          {props.src ? (
            <img src={props.src} alt={props.alt || ''} style={{ width: '100%', height: '100%', objectFit: props.objectFit || 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', color: '#64748B', fontSize: 12 }}>
              No image selected
            </div>
          )}
        </div>
      );
    default:
      return (
        <div key={comp.id} style={commonStyle} className={props.className}>
          <div style={{ padding: 8, fontSize: 12, color: '#64748B' }}>
            {props.text || type}
          </div>
        </div>
      );
  }
};

const devicePresets = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 667, label: 'Mobile' },
};

const PreviewWindow = ({ isOpen, onClose, components }) => {
  const [device, setDevice] = useState('desktop');

  if (!isOpen) return null;

  const preset = devicePresets[device] || devicePresets.desktop;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary'}`}>
            <Monitor className="w-4 h-4" />
          </button>
          <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary'}`}>
            <Tablet className="w-4 h-4" />
          </button>
          <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary'}`}>
            <Smartphone className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-secondary ml-2">{preset.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">{components?.length || 0} components</span>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-light text-text-secondary hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center p-8 overflow-auto">
        <div
          style={{
            width: typeof preset.width === 'number' ? preset.width : '100%',
            minHeight: typeof preset.height === 'number' ? preset.height : '100%',
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: device !== 'desktop' ? '8px' : 0,
            boxShadow: device !== 'desktop' ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
            overflow: 'hidden',
          }}
        >
          {components?.map(renderComponent)}
          {(!components || components.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              No components to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewWindow;
