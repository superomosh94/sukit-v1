import React, { useState } from 'react';
import { Globe, FileText, Link, Clock, Calendar, Save } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const GeneralSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState(settings.general || {
        siteTitle: 'My SuKit Site',
        siteDescription: 'Built with SuKit Visual Builder',
        siteUrl: 'https://mysite.com',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        language: 'en',
    });

    const timezones = [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Dubai',
        'Australia/Sydney', 'Pacific/Auckland'
    ];

    const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMMM D, YYYY'];
    const timeFormats = ['12h', '24h'];
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'ja', name: '日本語' },
        { code: 'zh', name: '中文' },
    ];

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings('general', localSettings);
        alert('Settings saved successfully!');
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">General Settings</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Site Title</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            value={localSettings.siteTitle}
                            onChange={(e) => handleChange('siteTitle', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Appears in browser title bar and SEO</p>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Site Description</label>
                    <textarea
                        value={localSettings.siteDescription}
                        onChange={(e) => handleChange('siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-text-secondary mt-1">Used for SEO meta description</p>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Site URL</label>
                    <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="url"
                            value={localSettings.siteUrl}
                            onChange={(e) => handleChange('siteUrl', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Timezone</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <select
                                value={localSettings.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {timezones.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Date Format</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <select
                                value={localSettings.dateFormat}
                                onChange={(e) => handleChange('dateFormat', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {dateFormats.map(format => (
                                    <option key={format} value={format}>{format}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Time Format</label>
                        <select
                            value={localSettings.timeFormat}
                            onChange={(e) => handleChange('timeFormat', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {timeFormats.map(format => (
                                <option key={format} value={format}>{format}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Language</label>
                        <select
                            value={localSettings.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save Changes
            </button>
        </div>
    );
};

export default GeneralSettings;
