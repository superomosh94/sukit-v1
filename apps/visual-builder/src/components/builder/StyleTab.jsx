import React from 'react';
import { PaintBucket, Type, Box, BorderAll, Sun, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const colorPresets = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
    '#ec4899', '#111827', '#374151', '#6b7280', '#9ca3af',
];

const fontFamilies = [
    'Inter', 'system-ui', 'Arial', 'Helvetica', 'Georgia',
    'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
];

const shadowPresets = [
    { name: 'None', value: 'none' },
    { name: 'Small', value: '0 1px 2px 0 rgba(0,0,0,0.05)' },
    { name: 'Medium', value: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    { name: 'Large', value: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    { name: 'XL', value: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    { name: '2XL', value: '0 25px 50px -12px rgba(0,0,0,0.25)' },
];

const Section = ({ icon: Icon, label, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="border-b border-border pb-3 mb-3">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 w-full text-left mb-2"
            >
                <Icon className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider flex-1">{label}</span>
                <ChevronDown className={cn('w-3 h-3 text-text-secondary transition-transform', open && 'rotate-180')} />
            </button>
            {open && children}
        </div>
    );
};

const ColorPicker = ({ label, value, onChange }) => (
    <div className="mb-2">
        {label && <span className="text-xs text-text-secondary block mb-1">{label}</span>}
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0.5 border border-border rounded cursor-pointer"
            />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
            />
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
            {colorPresets.map((c) => (
                <button
                    key={c}
                    onClick={() => onChange(c)}
                    className={cn(
                        'w-4 h-4 rounded-full border',
                        value === c ? 'border-primary-500 ring-1 ring-primary-500' : 'border-border'
                    )}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
    </div>
);

export const StyleTab = ({ component, onUpdate }) => {
    if (!component) {
        return (
            <div className="p-4 text-center text-text-secondary text-xs">
                Select a component to edit styles
            </div>
        );
    }

    const props = component.props || {};

    const updateProp = (key, value) => {
        onUpdate({ props: { ...props, [key]: value } });
    };

    return (
        <div className="p-4 overflow-y-auto h-full text-xs">
            <Section icon={PaintBucket} label="Colors">
                <ColorPicker label="Background" value={props.backgroundColor} onChange={(v) => updateProp('backgroundColor', v)} />
                <ColorPicker label="Text Color" value={props.color} onChange={(v) => updateProp('color', v)} />
                <ColorPicker label="Border Color" value={props.borderColor} onChange={(v) => updateProp('borderColor', v)} />
            </Section>

            <Section icon={Type} label="Typography">
                <div className="space-y-2">
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Font Family</span>
                        <select
                            value={props.fontFamily || ''}
                            onChange={(e) => updateProp('fontFamily', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        >
                            <option value="">Default</option>
                            {fontFamilies.map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Font Size (px)</span>
                            <input
                                type="number"
                                value={props.fontSize || ''}
                                onChange={(e) => updateProp('fontSize', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                                placeholder="16"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Font Weight</span>
                            <select
                                value={props.fontWeight || ''}
                                onChange={(e) => updateProp('fontWeight', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            >
                                <option value="">Default</option>
                                <option value="300">Light (300)</option>
                                <option value="400">Normal (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi Bold (600)</option>
                                <option value="700">Bold (700)</option>
                                <option value="800">Extra Bold (800)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Line Height</span>
                            <input
                                type="number"
                                step="0.1"
                                value={props.lineHeight || ''}
                                onChange={(e) => updateProp('lineHeight', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                                placeholder="1.6"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Letter Spacing (px)</span>
                            <input
                                type="number"
                                step="0.5"
                                value={props.letterSpacing || ''}
                                onChange={(e) => updateProp('letterSpacing', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            <Section icon={Box} label="Spacing">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Padding Top</span>
                        <input
                            type="number"
                            value={props.paddingTop ?? props.padding ?? ''}
                            onChange={(e) => updateProp('paddingTop', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Padding Bottom</span>
                        <input
                            type="number"
                            value={props.paddingBottom ?? props.padding ?? ''}
                            onChange={(e) => updateProp('paddingBottom', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Padding Left</span>
                        <input
                            type="number"
                            value={props.paddingLeft ?? props.padding ?? ''}
                            onChange={(e) => updateProp('paddingLeft', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Padding Right</span>
                        <input
                            type="number"
                            value={props.paddingRight ?? props.padding ?? ''}
                            onChange={(e) => updateProp('paddingRight', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Margin Top</span>
                        <input
                            type="number"
                            value={props.marginTop || ''}
                            onChange={(e) => updateProp('marginTop', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Margin Bottom</span>
                        <input
                            type="number"
                            value={props.marginBottom || ''}
                            onChange={(e) => updateProp('marginBottom', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            placeholder="0"
                        />
                    </div>
                </div>
            </Section>

            <Section icon={BorderAll} label="Borders">
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Border Width (px)</span>
                            <input
                                type="number"
                                value={props.borderWidth || ''}
                                onChange={(e) => updateProp('borderWidth', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Border Radius (px)</span>
                            <input
                                type="number"
                                value={props.borderRadius || ''}
                                onChange={(e) => updateProp('borderRadius', e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Border Style</span>
                        <select
                            value={props.borderStyle || 'solid'}
                            onChange={(e) => updateProp('borderStyle', e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                </div>
            </Section>

            <Section icon={Sun} label="Shadow">
                <div className="space-y-2">
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Shadow Preset</span>
                        <select
                            value={props.shadow || 'none'}
                            onChange={(e) => updateProp('shadow', e.target.value === 'none' ? '' : e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary mb-2"
                        >
                            {shadowPresets.map((s) => (
                                <option key={s.name} value={s.name === 'None' ? '' : s.value}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Custom Box Shadow</span>
                        <input
                            type="text"
                            value={props.boxShadow || ''}
                            onChange={(e) => updateProp('boxShadow', e.target.value)}
                            placeholder="0 4px 6px rgba(0,0,0,0.1)"
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Opacity (%)</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={props.opacity ?? 100}
                                onChange={(e) => updateProp('opacity', Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-xs text-text-secondary w-8 text-right">{props.opacity ?? 100}%</span>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

StyleTab.displayName = 'StyleTab';
export default StyleTab;
