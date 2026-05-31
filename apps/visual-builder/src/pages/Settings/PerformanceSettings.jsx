import React, { useState } from 'react';
import { Gauge, Zap, Image, Globe, Save, Database, Shield } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const PerformanceSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState(settings.performance || {
        minifyCss: true,
        minifyJs: true,
        imageOptimization: true,
        lazyLoad: true,
        cachingEnabled: true,
        cacheDuration: 3600,
        cdnUrl: '',
        gzipCompression: true,
        preloadLinks: true,
    });

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings('performance', localSettings);
        alert('Performance settings saved!');
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Performance Settings</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Minify CSS</label>
                        <p className="text-xs text-text-secondary">Remove whitespace and comments</p>
                    </div>
                    <button
                        onClick={() => handleChange('minifyCss', !localSettings.minifyCss)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.minifyCss ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.minifyCss ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Minify JavaScript</label>
                        <p className="text-xs text-text-secondary">Remove whitespace and comments</p>
                    </div>
                    <button
                        onClick={() => handleChange('minifyJs', !localSettings.minifyJs)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.minifyJs ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.minifyJs ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Image Optimization</label>
                        <p className="text-xs text-text-secondary">Compress and resize images automatically</p>
                    </div>
                    <button
                        onClick={() => handleChange('imageOptimization', !localSettings.imageOptimization)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.imageOptimization ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.imageOptimization ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Lazy Load Images</label>
                        <p className="text-xs text-text-secondary">Load images only when visible</p>
                    </div>
                    <button
                        onClick={() => handleChange('lazyLoad', !localSettings.lazyLoad)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.lazyLoad ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.lazyLoad ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Enable Caching</label>
                        <p className="text-xs text-text-secondary">Cache static assets for faster loading</p>
                    </div>
                    <button
                        onClick={() => handleChange('cachingEnabled', !localSettings.cachingEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.cachingEnabled ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.cachingEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                {localSettings.cachingEnabled && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Cache Duration (seconds)</label>
                        <input
                            type="number"
                            value={localSettings.cacheDuration}
                            onChange={(e) => handleChange('cacheDuration', parseInt(e.target.value))}
                            min={60}
                            max={86400}
                            step={60}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-text-secondary mt-1">1 minute to 24 hours</p>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Gzip Compression</label>
                        <p className="text-xs text-text-secondary">Compress responses for faster delivery</p>
                    </div>
                    <button
                        onClick={() => handleChange('gzipCompression', !localSettings.gzipCompression)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.gzipCompression ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.gzipCompression ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Preload Critical Links</label>
                        <p className="text-xs text-text-secondary">Preload important resources</p>
                    </div>
                    <button
                        onClick={() => handleChange('preloadLinks', !localSettings.preloadLinks)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            localSettings.preloadLinks ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.preloadLinks ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">CDN URL (Optional)</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            value={localSettings.cdnUrl}
                            onChange={(e) => handleChange('cdnUrl', e.target.value)}
                            placeholder="https://cdn.example.com"
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Leave empty to use local assets</p>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save Performance Settings
            </button>
        </div>
    );
};

export default PerformanceSettings;
