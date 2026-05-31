import React from 'react';
import { Type, Image, Square, MousePointerClick } from 'lucide-react';

const components = [
  { type: 'heading', label: 'Heading', icon: Type, defaultProps: { text: 'Heading', level: 'h1', fontSize: 32, fontWeight: '700' } },
  { type: 'paragraph', label: 'Paragraph', icon: Type, defaultProps: { text: 'This is a paragraph with sample text for your page.', fontSize: 16 } },
  { type: 'button', label: 'Button', icon: MousePointerClick, defaultProps: { text: 'Click Me', variant: 'primary', fontSize: 14 } },
  { type: 'image', label: 'Image', icon: Image, defaultProps: { src: '', alt: 'Image', objectFit: 'cover' } },
  { type: 'Container', label: 'Container', icon: Square, defaultProps: { padding: 16, backgroundColor: '#1E293B' } },
];

const ComponentLibrary = ({ onAddComponent }) => {
    return (
        <div className="w-64 bg-surface border-r border-border p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Components</h3>
            <div className="flex-1 overflow-auto space-y-2">
                {components.map(({ type, label, icon: Icon, defaultProps }) => (
                    <button
                        key={type}
                        onClick={() => onAddComponent(type, defaultProps)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-surface-light hover:bg-primary-500/10 hover:text-primary-500 rounded text-sm text-text-secondary transition-colors group"
                    >
                        <div className="w-7 h-7 rounded bg-surface flex items-center justify-center group-hover:bg-primary-500/10">
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ComponentLibrary;
