import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react';

export const ResponsiveTab = ({ component, onUpdate }) => {
    const [activeDevice, setActiveDevice] = useState('desktop');
    
    const devices = [
        { id: 'desktop', name: 'Desktop', icon: Monitor, minWidth: 1024 },
        { id: 'tablet', name: 'Tablet', icon: Tablet, minWidth: 768, maxWidth: 1023 },
        { id: 'mobile', name: 'Mobile', icon: Smartphone, maxWidth: 767 }
    ];

    const getDeviceStyles = () => {
        return component.responsiveStyles?.[activeDevice] || {};
    };

    const handleStyleChange = (key, value) => {
        const newResponsiveStyles = {
            ...component.responsiveStyles,
            [activeDevice]: {
                ...component.responsiveStyles?.[activeDevice],
                [key]: value
            }
        };
        onUpdate({ responsiveStyles: newResponsiveStyles });
    };

    const handleVisibilityChange = (visible) => {
        const newResponsiveStyles = {
            ...component.responsiveStyles,
            [activeDevice]: {
                ...component.responsiveStyles?.[activeDevice],
                visible
            }
        };
        onUpdate({ responsiveStyles: newResponsiveStyles });
    };

    return (
        <div className="space-y-4">
            {/* Device Selector */}
            <div className="flex gap-2">
                {devices.map((device) => (
                    <button
                        key={device.id}
                        onClick={() => setActiveDevice(device.id)}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-colors ${
                            activeDevice === device.id
                                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                : 'border-border text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <device.icon className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">{device.name}</span>
                    </button>
                ))}
            </div>
            
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                <div>
                    <label className="block text-sm text-text-primary">Hide on {devices.find(d => d.id === activeDevice)?.name}</label>
                    <p className="text-xs text-text-secondary">Component will not appear on this device</p>
                </div>
                <button
                    onClick={() => handleVisibilityChange(getDeviceStyles().visible !== false)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        getDeviceStyles().visible !== false ? 'bg-primary-500' : 'bg-surface-light'
                    }`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                        getDeviceStyles().visible !== false ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                </button>
            </div>
            
            {/* Responsive Styles */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-text-primary">Device-specific Styles</h4>
                
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Font Size (px)</label>
                    <input
                        type="number"
                        value={getDeviceStyles().fontSize || ''}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        placeholder="Inherit"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Padding (px)</label>
                    <input
                        type="number"
                        value={getDeviceStyles().padding || ''}
                        onChange={(e) => handleStyleChange('padding', e.target.value)}
                        placeholder="Inherit"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Margin (px)</label>
                    <input
                        type="number"
                        value={getDeviceStyles().margin || ''}
                        onChange={(e) => handleStyleChange('margin', e.target.value)}
                        placeholder="Inherit"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Width (%)</label>
                    <input
                        type="number"
                        value={getDeviceStyles().width || ''}
                        onChange={(e) => handleStyleChange('width', e.target.value)}
                        placeholder="Inherit"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
            
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                <p className="text-xs text-text-secondary">
                    💡 Responsive Tip: Styles set here will override default styles on {devices.find(d => d.id === activeDevice)?.name} devices.
                </p>
            </div>
        </div>
    );
};
