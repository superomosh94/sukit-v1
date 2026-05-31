import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const General = () => {
    const { settings, updateSettings } = useSettingsStore();
    const general = settings.general || {};

    const update = (key, value) => updateSettings('general', { [key]: value });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">General</h2>
                <p className="text-sm text-text-secondary mt-1">Site title, URL, timezone</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Site Title</label>
                    <input
                        type="text"
                        value={general.siteTitle || ''}
                        onChange={(e) => update('siteTitle', e.target.value)}
                        placeholder="My SuKit App"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Site URL</label>
                    <input
                        type="url"
                        value={general.siteUrl || ''}
                        onChange={(e) => update('siteUrl', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Timezone</label>
                    <select
                        value={general.timezone || 'UTC'}
                        onChange={(e) => update('timezone', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Berlin">Berlin</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Asia/Shanghai">Shanghai</option>
                        <option value="Africa/Nairobi">Nairobi</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Language</label>
                    <select
                        value={general.language || 'en'}
                        onChange={(e) => update('language', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Maintenance Mode</p>
                        <p className="text-xs text-text-secondary">Temporarily disable public access</p>
                    </div>
                    <button
                        onClick={() => update('maintenanceMode', !general.maintenanceMode)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${general.maintenanceMode ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${general.maintenanceMode ? 'translate-x-5' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default General;
