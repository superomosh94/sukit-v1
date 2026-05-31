import React, { useState } from 'react';
import { Palette, Image, Type, Globe, Save, Upload, X } from 'lucide-react';

export const WhiteLabelSettings = () => {
    const [settings, setSettings] = useState({
        enabled: false,
        appName: 'My App',
        logo: null,
        logoPreview: null,
        favicon: null,
        faviconPreview: null,
        primaryColor: '#3B82F6',
        removeBranding: false,
    });

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setSettings({ ...settings, logo: file, logoPreview: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    const handleFaviconUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setSettings({ ...settings, favicon: file, faviconPreview: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">White Label</h3>
            </div>
            <p className="text-sm text-text-secondary">Customize the app with your own branding</p>

            <div className="bg-surface border border-border rounded-lg p-5 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-text-primary">Enable White Label</p>
                        <p className="text-sm text-text-secondary mt-1">Replace SUKIT branding with your own</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${settings.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                {settings.enabled && (
                    <>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                                <Type className="w-4 h-4 text-text-secondary" />
                                App Name
                            </label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                placeholder="My App"
                                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                                <Image className="w-4 h-4 text-text-secondary" />
                                Logo
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-surface-light border border-border rounded-lg flex items-center justify-center overflow-hidden">
                                    {settings.logoPreview ? (
                                        <img src={settings.logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Image className="w-6 h-6 text-text-secondary" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer">
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        <span className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm cursor-pointer hover:bg-primary-600 transition-colors">
                                            Upload
                                        </span>
                                    </label>
                                    {settings.logoPreview && (
                                        <button
                                            onClick={() => setSettings({ ...settings, logo: null, logoPreview: null })}
                                            className="p-1.5 rounded hover:bg-danger-500/10"
                                        >
                                            <X className="w-4 h-4 text-danger-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                                <Globe className="w-4 h-4 text-text-secondary" />
                                Favicon
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-surface-light border border-border rounded flex items-center justify-center overflow-hidden">
                                    {settings.faviconPreview ? (
                                        <img src={settings.faviconPreview} alt="Favicon" className="w-full h-full object-contain" />
                                    ) : (
                                        <Globe className="w-5 h-5 text-text-secondary" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer">
                                        <input type="file" accept="image/x-icon,image/png,image/svg+xml" onChange={handleFaviconUpload} className="hidden" />
                                        <span className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm cursor-pointer hover:bg-primary-600 transition-colors">
                                            Upload
                                        </span>
                                    </label>
                                    {settings.faviconPreview && (
                                        <button
                                            onClick={() => setSettings({ ...settings, favicon: null, faviconPreview: null })}
                                            className="p-1.5 rounded hover:bg-danger-500/10"
                                        >
                                            <X className="w-4 h-4 text-danger-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                                <Palette className="w-4 h-4 text-text-secondary" />
                                Primary Color
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="w-10 h-10 p-0.5 border border-border rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-text-primary">Remove "Powered by SUKIT"</p>
                                <p className="text-sm text-text-secondary mt-1">Hide branding from the footer</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, removeBranding: !settings.removeBranding })}
                                className={`relative w-11 h-6 rounded-full transition-colors ${settings.removeBranding ? 'bg-primary-500' : 'bg-surface-light'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${settings.removeBranding ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={() => alert('White label settings saved!')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
                <Save className="w-4 h-4" />
                Save Settings
            </button>
        </div>
    );
};

WhiteLabelSettings.displayName = 'WhiteLabelSettings';
export default WhiteLabelSettings;
