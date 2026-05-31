import React from 'react';
import { Type, ChevronDown } from 'lucide-react';

const TypographyPanel = ({ typography, onChange }) => {
    const fonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 
        'Nunito', 'Playfair Display', 'Merriweather', 'Source Code Pro'
    ];

    const fontSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];
    const fontWeights = [300, 400, 500, 600, 700, 800];
    const lineHeights = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0];

    const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    const handleChange = (category, key, value) => {
        onChange({
            ...typography,
            [category]: { ...typography[category], [key]: value }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Typography</h3>
            </div>

            {/* Global Fonts */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Base Font Family</label>
                    <select
                        value={typography.base?.fontFamily || 'Inter'}
                        onChange={(e) => handleChange('base', 'fontFamily', e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {fonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Base Font Size (px)</label>
                    <select
                        value={typography.base?.fontSize || 16}
                        onChange={(e) => handleChange('base', 'fontSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {fontSizes.map(size => (
                            <option key={size} value={size}>{size}px</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Heading Scale */}
            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-text-primary mb-3">Heading Scale</h4>
                <div className="space-y-3">
                    {headingLevels.map((level) => (
                        <div key={level} className="flex items-center gap-3">
                            <span className="w-10 text-sm font-medium text-text-secondary">{level.toUpperCase()}</span>
                            <select
                                value={typography.headings?.[level]?.fontSize || (level === 'h1' ? 48 : level === 'h2' ? 36 : level === 'h3' ? 28 : level === 'h4' ? 24 : level === 'h5' ? 20 : 18)}
                                onChange={(e) => handleChange('headings', level, { ...typography.headings?.[level], fontSize: parseInt(e.target.value) })}
                                className="w-24 px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {fontSizes.map(size => (
                                    <option key={size} value={size}>{size}px</option>
                                ))}
                            </select>
                            <select
                                value={typography.headings?.[level]?.fontWeight || 700}
                                onChange={(e) => handleChange('headings', level, { ...typography.headings?.[level], fontWeight: parseInt(e.target.value) })}
                                className="w-24 px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {fontWeights.map(weight => (
                                    <option key={weight} value={weight}>{weight}</option>
                                ))}
                            </select>
                            <div className="flex-1">
                                <div 
                                    className="bg-surface-light rounded px-3 py-1 text-text-primary"
                                    style={{ 
                                        fontSize: `${typography.headings?.[level]?.fontSize || (level === 'h1' ? 48 : level === 'h2' ? 36 : level === 'h3' ? 28 : level === 'h4' ? 24 : level === 'h5' ? 20 : 18)}px`,
                                        fontWeight: typography.headings?.[level]?.fontWeight || 700,
                                        fontFamily: typography.base?.fontFamily || 'Inter'
                                    }}
                                >
                                    Preview
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Text */}
            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-text-primary mb-3">Body Text</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Line Height</label>
                        <select
                            value={typography.body?.lineHeight || 1.5}
                            onChange={(e) => handleChange('body', 'lineHeight', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {lineHeights.map(lh => (
                                <option key={lh} value={lh}>{lh}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Letter Spacing</label>
                        <select
                            value={typography.body?.letterSpacing || 0}
                            onChange={(e) => handleChange('body', 'letterSpacing', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {[0, 0.5, 1, 1.5, 2].map(ls => (
                                <option key={ls} value={ls}>{ls}px</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypographyPanel;
