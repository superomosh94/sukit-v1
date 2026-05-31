import React from 'react';
import { Square } from 'lucide-react';

const SpacingControl = ({ spacing, onChange }) => {
    const spacingScales = [
        { key: 'xs', name: 'Extra Small', defaultValue: 4 },
        { key: 'sm', name: 'Small', defaultValue: 8 },
        { key: 'md', name: 'Medium', defaultValue: 16 },
        { key: 'lg', name: 'Large', defaultValue: 24 },
        { key: 'xl', name: 'Extra Large', defaultValue: 32 },
        { key: '2xl', name: '2X Large', defaultValue: 48 },
        { key: '3xl', name: '3X Large', defaultValue: 64 },
    ];

    const handleChange = (key, value) => {
        onChange({ ...spacing, [key]: parseInt(value) });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Square className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Spacing Scale</h3>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Base Unit (px)</label>
                <input
                    type="number"
                    value={spacing.base || 4}
                    onChange={(e) => handleChange('base', e.target.value)}
                    min={2}
                    max={16}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-text-secondary mt-1">All spacing values are multiples of this unit</p>
            </div>

            <div className="space-y-4">
                {spacingScales.map((scale) => (
                    <div key={scale.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">{scale.name}</label>
                            <span className="text-xs text-text-secondary">{spacing[scale.key] || scale.defaultValue}px</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={128}
                            step={4}
                            value={spacing[scale.key] || scale.defaultValue}
                            onChange={(e) => handleChange(scale.key, e.target.value)}
                            className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>0</span>
                            <span>32</span>
                            <span>64</span>
                            <span>96</span>
                            <span>128</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div 
                                className="h-4 bg-primary-500 rounded"
                                style={{ width: `${spacing[scale.key] || scale.defaultValue}px` }}
                            />
                            <span className="text-xs text-text-secondary">Preview</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpacingControl;
