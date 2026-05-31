import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { ExternalLink } from 'lucide-react';

const Integrations = () => {
    const { settings, updateSettings } = useSettingsStore();
    const integrations = settings.integrations || {};

    const update = (key, value) => updateSettings('integrations', { [key]: value });

    const integrationsList = [
        {
            key: 'github',
            name: 'GitHub',
            description: 'Version control and CI/CD deployments',
            fields: [
                { key: 'repoUrl', label: 'Repository URL', placeholder: 'https://github.com/user/repo' },
                { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' },
            ]
        },
        {
            key: 'vercel',
            name: 'Vercel',
            description: 'Deploy and host your project',
            fields: [
                { key: 'token', label: 'API Token', type: 'password', placeholder: 'vercel_...' },
                { key: 'teamId', label: 'Team ID', placeholder: 'team_xxx' },
            ]
        },
        {
            key: 'sentry',
            name: 'Sentry',
            description: 'Error tracking and performance monitoring',
            fields: [
                { key: 'dsn', label: 'DSN', placeholder: 'https://xxx@sentry.io/xxx' },
            ]
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Integrations</h2>
                <p className="text-sm text-text-secondary mt-1">Connect external services</p>
            </div>

            {integrationsList.map((integration) => {
                const config = integrations[integration.key] || {};
                const isEnabled = config.enabled || false;

                return (
                    <div key={integration.key} className="bg-surface border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary">{integration.name}</h3>
                                <p className="text-xs text-text-secondary">{integration.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a href="#" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                                    Docs <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                    onClick={() => update(integration.key, { ...config, enabled: !isEnabled })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${isEnabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${isEnabled ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {isEnabled && (
                            <div className="space-y-3 pt-2 border-t border-border">
                                {integration.fields.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-text-primary mb-1">{field.label}</label>
                                        <input
                                            type={field.type || 'text'}
                                            value={config[field.key] || ''}
                                            onChange={(e) => update(integration.key, { ...config, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Integrations;
