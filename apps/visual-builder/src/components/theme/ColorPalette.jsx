import React, { useState } from 'react';
import { Palette, Copy, Check, RefreshCw } from 'lucide-react';

const ColorPalette = ({ colors, onChange }) => {
    const [copiedColor, setCopiedColor] = useState(null);
    const [customColor, setCustomColor] = useState('');

    const colorCategories = [
        { key: 'primary', label: 'Primary', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary', description: 'Accent color' },
        { key: 'success', label: 'Success', description: 'Success messages' },
        { key: 'warning', label: 'Warning', description: 'Warning messages' },
        { key: 'danger', label: 'Danger', description: 'Error messages' },
        { key: 'background', label: 'Background', description: 'Page background' },
        { key: 'surface', label: 'Surface', description: 'Card backgrounds' },
        { key: 'text', label: 'Text', description: 'Primary text' },
        { key: 'textSecondary', label: 'Text Secondary', description: 'Secondary text' },
        { key: 'border', label: 'Border', description: 'Border colors' },
    ];

    const copyToClipboard = (color, name) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(name);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const handleColorChange = (key, value) => {
        onChange({ ...colors, [key]: value });
    };

    const addCustomColor = () => {
        if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
            onChange({ ...colors, custom: [...(colors.custom || []), customColor] });
            setCustomColor('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Color Palette</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {colorCategories.map((cat) => (
                    <div key={cat.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-text-primary">{cat.label}</label>
                            <span className="text-xs text-text-secondary">{cat.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                                style={{ backgroundColor: colors[cat.key] }}
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'color';
                                    input.value = colors[cat.key];
                                    input.onchange = (e) => handleColorChange(cat.key, e.target.value);
                                    input.click();
                                }}
                            />
                            <input
                                type="text"
                                value={colors[cat.key] || ''}
                                onChange={(e) => handleColorChange(cat.key, e.target.value)}
                                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={() => copyToClipboard(colors[cat.key], cat.key)}
                                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                            >
                                {copiedColor === cat.key ? (
                                    <Check className="w-4 h-4 text-success-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-text-secondary" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Colors */}
            <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-text-primary mb-2">Custom Colors</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={addCustomColor}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
                
                {colors.custom && colors.custom.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {colors.custom.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-8 h-8 rounded-lg border border-border cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => copyToClipboard(color, `custom-${idx}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorPalette;
