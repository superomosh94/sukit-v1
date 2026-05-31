import React, { useState } from 'react';
import { Plug, Github, Globe, BarChart3, Mail, Shield, Database, Save } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const IntegrationSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [integrations, setIntegrations] = useState(settings.integrations || {
        github: { enabled: false, token: '', repo: '' },
        vercel: { enabled: false, token: '', projectId: '' },
        sentry: { enabled: false, dsn: '' },
        analytics: { enabled: false, trackingId: '' },
        mailchimp: { enabled: false, apiKey: '', listId: '' },
        slack: { enabled: false, webhookUrl: '' },
    });

    const handleToggle = (key) => {
        setIntegrations(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const handleChange = (key, field, value) => {
        setIntegrations(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleSave = () => {
        updateSettings('integrations', integrations);
        alert('Integration settings saved!');
    };

    const integrationsList = [
        { id: 'github', name: 'GitHub', icon: Github, description: 'Connect your GitHub account for version control', fields: ['token', 'repo'] },
        { id: 'vercel', name: 'Vercel', icon: Globe, description: 'Deploy directly to Vercel', fields: ['token', 'projectId'] },
        { id: 'sentry', name: 'Sentry', icon: Shield, description: 'Error tracking and monitoring', fields: ['dsn'] },
        { id: 'analytics', name: 'Google Analytics', icon: BarChart3, description: 'Track website analytics', fields: ['trackingId'] },
        { id: 'mailchimp', name: 'Mailchimp', icon: Mail, description: 'Email marketing integration', fields: ['apiKey', 'listId'] },
        { id: 'slack', name: 'Slack', icon: Database, description: 'Receive notifications in Slack', fields: ['webhookUrl'] },
    ];

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Integrations</h3>
            </div>

            <div className="space-y-4">
                {integrationsList.map((integration) => {
                    const config = integrations[integration.id];
                    return (
                        <div key={integration.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <integration.icon className="w-5 h-5 text-primary-500" />
                                    <div>
                                        <h4 className="font-medium text-text-primary">{integration.name}</h4>
                                        <p className="text-xs text-text-secondary">{integration.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle(integration.id)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        config.enabled ? 'bg-primary-500' : 'bg-surface-light'
                                    }`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                                        config.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                            
                            {config.enabled && (
                                <div className="border-t border-border p-4 space-y-3">
                                    {integration.fields.includes('token') && (
                                        <input
                                            type="password"
                                            placeholder={`${integration.name} Token`}
                                            value={config.token || ''}
                                            onChange={(e) => handleChange(integration.id, 'token', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('repo') && (
                                        <input
                                            type="text"
                                            placeholder="Repository Name"
                                            value={config.repo || ''}
                                            onChange={(e) => handleChange(integration.id, 'repo', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('projectId') && (
                                        <input
                                            type="text"
                                            placeholder="Project ID"
                                            value={config.projectId || ''}
                                            onChange={(e) => handleChange(integration.id, 'projectId', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('dsn') && (
                                        <input
                                            type="text"
                                            placeholder="Sentry DSN"
                                            value={config.dsn || ''}
                                            onChange={(e) => handleChange(integration.id, 'dsn', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('trackingId') && (
                                        <input
                                            type="text"
                                            placeholder="Tracking ID (G-XXXXXXXX)"
                                            value={config.trackingId || ''}
                                            onChange={(e) => handleChange(integration.id, 'trackingId', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('apiKey') && (
                                        <input
                                            type="password"
                                            placeholder="API Key"
                                            value={config.apiKey || ''}
                                            onChange={(e) => handleChange(integration.id, 'apiKey', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('listId') && (
                                        <input
                                            type="text"
                                            placeholder="List ID"
                                            value={config.listId || ''}
                                            onChange={(e) => handleChange(integration.id, 'listId', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                    {integration.fields.includes('webhookUrl') && (
                                        <input
                                            type="text"
                                            placeholder="Webhook URL"
                                            value={config.webhookUrl || ''}
                                            onChange={(e) => handleChange(integration.id, 'webhookUrl', e.target.value)}
                                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save Integrations
            </button>
        </div>
    );
};

export default IntegrationSettings;
