import React from 'react';
import { Layers } from 'lucide-react';

const ShadowControl = ({ shadows, onChange }) => {
    const shadowLevels = [
        { key: 'none', name: 'None', defaultValue: 'none' },
        { key: 'sm', name: 'Small', defaultValue: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        { key: 'md', name: 'Medium', defaultValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
        { key: 'lg', name: 'Large', defaultValue: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
        { key: 'xl', name: 'Extra Large', defaultValue: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
        { key: '2xl', name: '2X Large', defaultValue: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
        { key: 'inner', name: 'Inner', defaultValue: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' },
    ];

    const handleChange = (key, value) => {
        onChange({ ...shadows, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Shadows</h3>
            </div>

            <div className="space-y-4">
                {shadowLevels.map((level) => (
                    <div key={level.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">{level.name}</label>
                            <button
                                onClick={() => handleChange(level.key, level.defaultValue)}
                                className="text-xs text-primary-500 hover:underline"
                            >
                                Reset
                            </button>
                        </div>
                        <textarea
                            value={shadows[level.key] || level.defaultValue}
                            onChange={(e) => handleChange(level.key, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div 
                            className="w-full h-16 bg-surface rounded-lg flex items-center justify-center text-xs text-text-secondary transition-shadow"
                            style={{ boxShadow: shadows[level.key] || level.defaultValue }}
                        >
                            Preview
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShadowControl;
