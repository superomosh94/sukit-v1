import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const Performance = () => {
    const { settings, updateSettings } = useSettingsStore();
    const perf = settings.performance || {};

    const update = (key, value) => updateSettings('performance', { [key]: value });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Performance</h2>
                <p className="text-sm text-text-secondary mt-1">Caching, optimization</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Asset Caching</p>
                        <p className="text-xs text-text-secondary">Cache static assets with fingerprinted filenames</p>
                    </div>
                    <button
                        onClick={() => update('assetCaching', !perf.assetCaching)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${perf.assetCaching ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${perf.assetCaching ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Minify CSS & JS</p>
                        <p className="text-xs text-text-secondary">Compress output files for production</p>
                    </div>
                    <button
                        onClick={() => update('minify', !perf.minify)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${perf.minify ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${perf.minify ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Image Optimization</p>
                        <p className="text-xs text-text-secondary">Auto-compress and resize images</p>
                    </div>
                    <button
                        onClick={() => update('imageOptimization', !perf.imageOptimization)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${perf.imageOptimization ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${perf.imageOptimization ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Code Splitting</p>
                        <p className="text-xs text-text-secondary">Split code into lazy-loaded chunks</p>
                    </div>
                    <button
                        onClick={() => update('codeSplitting', !perf.codeSplitting)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${perf.codeSplitting ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${perf.codeSplitting ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Cache Duration (seconds)</label>
                    <input
                        type="number"
                        value={perf.cacheDuration || 86400}
                        onChange={(e) => update('cacheDuration', parseInt(e.target.value) || 86400)}
                        min={0}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-text-secondary">Default: 86400 (24 hours)</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Max Image Size (KB)</label>
                    <input
                        type="number"
                        value={perf.maxImageSize || 500}
                        onChange={(e) => update('maxImageSize', parseInt(e.target.value) || 500)}
                        min={50}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default Performance;
