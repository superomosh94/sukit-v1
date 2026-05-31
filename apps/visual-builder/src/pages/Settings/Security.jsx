import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Shield, Trash2 } from 'lucide-react';

const Security = () => {
    const { settings, updateSettings } = useSettingsStore();
    const security = settings.security || {};

    const update = (key, value) => updateSettings('security', { [key]: value });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Security</h2>
                <p className="text-sm text-text-secondary mt-1">2FA, sessions, passwords</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Two-Factor Authentication</p>
                        <p className="text-xs text-text-secondary">Require 2FA for all team members</p>
                    </div>
                    <button
                        onClick={() => update('twoFactorEnabled', !security.twoFactorEnabled)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${security.twoFactorEnabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${security.twoFactorEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Session Timeout</p>
                        <p className="text-xs text-text-secondary">Auto-logout after inactivity</p>
                    </div>
                    <select
                        value={security.sessionTimeout || 3600}
                        onChange={(e) => update('sessionTimeout', parseInt(e.target.value))}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value={900}>15 minutes</option>
                        <option value={1800}>30 minutes</option>
                        <option value={3600}>1 hour</option>
                        <option value={7200}>2 hours</option>
                        <option value={86400}>24 hours</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Minimum Password Length</label>
                    <input
                        type="number"
                        value={security.minPasswordLength || 8}
                        onChange={(e) => update('minPasswordLength', parseInt(e.target.value) || 8)}
                        min={6}
                        max={32}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">IP Whitelisting</p>
                        <p className="text-xs text-text-secondary">Restrict access to specific IP addresses</p>
                    </div>
                    <button
                        onClick={() => update('ipWhitelisting', !security.ipWhitelisting)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${security.ipWhitelisting ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${security.ipWhitelisting ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Audit Logging</p>
                        <p className="text-xs text-text-secondary">Log all user actions for compliance</p>
                    </div>
                    <button
                        onClick={() => update('auditLogging', !security.auditLogging)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${security.auditLogging ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${security.auditLogging ? 'translate-x-5' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-red-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Delete All Sessions</p>
                        <p className="text-xs text-text-secondary">Force logout all users</p>
                    </div>
                    <button className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                        Revoke All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Security;
