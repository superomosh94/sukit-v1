import React from 'react';
import { Square } from 'lucide-react';

const BorderRadiusControl = ({ borderRadius, onChange }) => {
    const radiusOptions = [
        { key: 'none', name: 'None', defaultValue: 0 },
        { key: 'sm', name: 'Small', defaultValue: 4 },
        { key: 'md', name: 'Medium', defaultValue: 8 },
        { key: 'lg', name: 'Large', defaultValue: 12 },
        { key: 'xl', name: 'Extra Large', defaultValue: 16 },
        { key: '2xl', name: '2X Large', defaultValue: 24 },
        { key: 'full', name: 'Full', defaultValue: 9999 },
    ];

    const handleChange = (key, value) => {
        onChange({ ...borderRadius, [key]: parseInt(value) });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Square className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Border Radius</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {radiusOptions.map((option) => (
                    <div key={option.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">{option.name}</label>
                            <span className="text-xs text-text-secondary">{borderRadius[option.key] || option.defaultValue}px</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={option.key === 'full' ? 100 : 32}
                            step={2}
                            value={borderRadius[option.key] || option.defaultValue}
                            onChange={(e) => handleChange(option.key, e.target.value)}
                            className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                        />
                        <div 
                            className="w-full h-16 bg-primary-500"
                            style={{ borderRadius: `${borderRadius[option.key] || option.defaultValue}px` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BorderRadiusControl;
