import React, { useState } from 'react';
import { Sliders, Grid, Eye, Save, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const EditorSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState(settings.editor || {
        gridSize: 20,
        snapToGrid: true,
        showGuides: true,
        autoSave: true,
        autoSaveInterval: 30,
        defaultDevice: 'desktop',
        showRulers: true,
        showGridLines: true,
    });

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings('editor', localSettings);
        alert('Editor settings saved!');
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Editor Settings</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Grid Size (px)</label>
                    <input
                        type="range"
                        min={4}
                        max={50}
                        step={2}
                        value={localSettings.gridSize}
                        onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
                        className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                        <span>4px</span>
                        <span>20px</span>
                        <span>50px</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">Current: {localSettings.gridSize}px</p>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Snap to Grid</label>
                        <p className="text-xs text-text-secondary">Components snap to grid points</p>
                    </div>
                    <button
                        onClick={() => handleChange('snapToGrid', !localSettings.snapToGrid)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localSettings.snapToGrid ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.snapToGrid ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Show Alignment Guides</label>
                        <p className="text-xs text-text-secondary">Show guides when aligning components</p>
                    </div>
                    <button
                        onClick={() => handleChange('showGuides', !localSettings.showGuides)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localSettings.showGuides ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.showGuides ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Show Rulers</label>
                        <p className="text-xs text-text-secondary">Display rulers on canvas edges</p>
                    </div>
                    <button
                        onClick={() => handleChange('showRulers', !localSettings.showRulers)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localSettings.showRulers ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.showRulers ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Show Grid Lines</label>
                        <p className="text-xs text-text-secondary">Display grid overlay on canvas</p>
                    </div>
                    <button
                        onClick={() => handleChange('showGridLines', !localSettings.showGridLines)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localSettings.showGridLines ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.showGridLines ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Auto Save</label>
                        <p className="text-xs text-text-secondary">Automatically save your work</p>
                    </div>
                    <button
                        onClick={() => handleChange('autoSave', !localSettings.autoSave)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            localSettings.autoSave ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                            localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>

                {localSettings.autoSave && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Auto Save Interval (seconds)</label>
                        <input
                            type="number"
                            value={localSettings.autoSaveInterval}
                            onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value))}
                            min={10}
                            max={300}
                            step={5}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Default Device</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleChange('defaultDevice', 'desktop')}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                                localSettings.defaultDevice === 'desktop'
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                    : 'border-border text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <Monitor className="w-4 h-4" />
                            Desktop
                        </button>
                        <button
                            onClick={() => handleChange('defaultDevice', 'tablet')}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                                localSettings.defaultDevice === 'tablet'
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                    : 'border-border text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <Tablet className="w-4 h-4" />
                            Tablet
                        </button>
                        <button
                            onClick={() => handleChange('defaultDevice', 'mobile')}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                                localSettings.defaultDevice === 'mobile'
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                    : 'border-border text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            Mobile
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save Editor Settings
            </button>
        </div>
    );
};

export default EditorSettings;
