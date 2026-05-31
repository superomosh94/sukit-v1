import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
    Globe, Sliders, Search, Gauge, Users, Plug, Shield, 
    ChevronRight, Save, RotateCcw, Code 
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

const Settings = () => {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const { saveSettings, resetSettings } = useSettingsStore();

    const settingsSections = [
        { path: '/settings/general', name: 'General', icon: Globe, description: 'Site title, URL, timezone' },
        { path: '/settings/editor', name: 'Editor', icon: Sliders, description: 'Grid, snap, auto-save' },
        { path: '/settings/seo', name: 'SEO', icon: Search, description: 'Meta tags, Open Graph' },
        { path: '/settings/performance', name: 'Performance', icon: Gauge, description: 'Caching, optimization' },
        { path: '/settings/team', name: 'Team', icon: Users, description: 'Members, roles, invites' },
        { path: '/settings/integrations', name: 'Integrations', icon: Plug, description: 'GitHub, Vercel, Sentry' },
        { path: '/settings/security', name: 'Security', icon: Shield, description: '2FA, sessions, passwords' },
    ];

    const handleSaveAll = async () => {
        await saveSettings();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleResetAll = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            resetSettings();
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                    <p className="text-text-secondary mt-1">Configure your application settings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/developer')}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-primary-500 hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                    >
                        <Code className="w-4 h-4" />
                        Developer Tools
                    </button>
                    <button
                        onClick={handleResetAll}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset All
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        {saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save All</>}
                    </button>
                </div>
            </div>

            {/* Settings Layout */}
            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 shrink-0 space-y-1">
                    {settingsSections.map((section) => (
                        <NavLink
                            key={section.path}
                            to={section.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-primary-500/20 text-primary-500'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <section.icon className="w-4 h-4" />
                                <div>
                                    <p className="text-sm font-medium">{section.name}</p>
                                    <p className="text-xs opacity-70">{section.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                        </NavLink>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Settings;
