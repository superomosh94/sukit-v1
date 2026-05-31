import React, { useState } from 'react';
import { X, Star, Download, Shield, Settings, Play, Info, Image, Check, ChevronRight, Plug } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PluginPreviewModal = ({ plugin, onClose, onInstall }) => {
    const [activeTab, setActiveTab] = useState('demo');
    const [settings, setSettings] = useState({});
    const [demoStatus, setDemoStatus] = useState(null);

    const handleDemoAction = async (action, data) => {
        setDemoStatus({ loading: true });
        setTimeout(() => {
            setDemoStatus({
                loading: false,
                success: action === 'payment',
                message: action === 'payment' ? 'Payment processed successfully!' : 'Action completed'
            });
            setTimeout(() => setDemoStatus(null), 3000);
        }, 1500);
    };

    const tabs = [
        { id: 'demo', label: 'Live Demo', icon: Play },
        { id: 'details', label: 'Details', icon: Info },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'screenshots', label: 'Screenshots', icon: Image }
    ];

    const features = [
        'PCI Compliant',
        'Webhook Support',
        'Subscription Billing',
        'Refund Management',
        'Multiple Currencies',
        'Fraud Detection'
    ];

    if (!plugin) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                            {plugin.icon ? <img src={plugin.icon} alt="" className="w-5 h-5" /> : <Plug className="w-5 h-5 text-primary-500" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">{plugin.displayName || plugin.name}</h2>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <span>v{plugin.version || '1.0.0'}</span>
                                <span>|</span>
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-warning-500 fill-current" />
                                    <span>{plugin.rating || 'N/A'}</span>
                                </div>
                                <span>|</span>
                                <span>{(plugin.downloads || 0).toLocaleString()} downloads</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
                        <X size={18} className="text-text-secondary" />
                    </button>
                </div>

                <div className="flex border-b border-border px-4 bg-surface-light/30">
                    {tabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-4 py-2.5 text-sm font-medium transition-colors relative flex items-center gap-1.5',
                                    activeTab === tab.id
                                        ? 'text-primary-500'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                            >
                                <TabIcon size={14} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'demo' && (
                        <div className="space-y-4">
                            <div className="bg-surface rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-text-primary">Live Interactive Demo</h3>
                                        <p className="text-sm text-text-secondary mt-0.5">
                                            Try the plugin before installing
                                        </p>
                                    </div>
                                    {plugin.preview?.interactive && (
                                        <span className="px-2 py-1 bg-success-500/10 text-success-500 text-xs font-medium rounded-full flex items-center gap-1">
                                            <Play size={10} />
                                            Interactive
                                        </span>
                                    )}
                                </div>

                                <div
                                    className="border border-border rounded-lg overflow-hidden"
                                    style={{
                                        minHeight: plugin.preview?.height || 400,
                                        background: plugin.preview?.background || '#1E293B'
                                    }}
                                >
                                    <div className="flex items-center justify-center h-full min-h-[300px]">
                                        <div className="text-center max-w-sm">
                                            <div className="mb-3">
                                                {plugin.icon ? <img src={plugin.icon} alt="" className="w-12 h-12 mx-auto" /> : <Plug className="w-12 h-12 text-text-secondary mx-auto" />}
                                            </div>
                                            <p className="text-sm text-text-secondary mb-2">Install the plugin to see the live preview</p>
                                            <p className="text-xs text-text-secondary">
                                                Interactive demo available after installation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {demoStatus && (
                                    <div className={cn(
                                        'mt-3 p-3 rounded-lg text-sm flex items-center gap-2 border',
                                        demoStatus.success
                                            ? 'bg-success-500/10 text-success-500 border-success-500/20'
                                            : 'bg-danger-500/10 text-danger-500 border-danger-500/20'
                                    )}>
                                        {demoStatus.success ? <Check size={16} /> : <X size={16} />}
                                        {demoStatus.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-6 max-w-3xl">
                            <div>
                                <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{plugin.description}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-text-primary mb-3">Features</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                                            <Shield size={14} className="text-success-500 flex-shrink-0" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-text-primary mb-3">Requirements</h3>
                                <div className="bg-surface rounded-lg p-4 space-y-2 text-sm border border-border">
                                    {plugin.requirements?.node && (
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <ChevronRight size={14} />
                                            Node.js {plugin.requirements.node}
                                        </div>
                                    )}
                                    {plugin.requirements?.sukit && (
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <ChevronRight size={14} />
                                            SuKit {plugin.requirements.sukit}
                                        </div>
                                    )}
                                    {plugin.requirements?.plugins?.map((p) => (
                                        <div key={p} className="flex items-center gap-2 text-text-secondary">
                                            <ChevronRight size={14} />
                                            {p} plugin (auto-installed)
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-text-primary mb-3">Changelog</h3>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { version: plugin.version, note: 'Latest release' },
                                        { version: '1.1.0', note: 'Added webhook support' },
                                        { version: '1.0.0', note: 'Initial release' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-text-secondary">
                                            <span className="font-medium text-text-primary min-w-[60px]">v{item.version}</span>
                                            <span>{item.note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-4 max-w-2xl">
                            <div className="bg-surface rounded-lg p-3 border border-border">
                                <p className="text-sm text-text-secondary flex items-center gap-1">
                                    <Settings size={14} />
                                    Configure before installation. Can be changed later from plugin settings.
                                </p>
                            </div>

                            {plugin.settings && Object.entries(plugin.settings).map(([key, config]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                                        {config.label}
                                        {config.required && <span className="text-danger-500 ml-1">*</span>}
                                    </label>
                                    {config.type === 'select' ? (
                                        <select
                                            value={settings[key] || config.default || ''}
                                            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-text-primary"
                                        >
                                            {config.options?.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : config.type === 'password' ? (
                                        <input
                                            type="password"
                                            placeholder={config.placeholder || ''}
                                            value={settings[key] || ''}
                                            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-text-primary placeholder-text-secondary"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={config.placeholder || ''}
                                            value={settings[key] || ''}
                                            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-text-primary placeholder-text-secondary"
                                        />
                                    )}
                                    {config.helper && (
                                        <p className="mt-1 text-xs text-text-secondary">{config.helper}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'screenshots' && (
                        <div className="space-y-4">
                            {plugin.screenshots && plugin.screenshots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {plugin.screenshots.map((screenshot, index) => (
                                        <div key={index} className="border border-border rounded-lg overflow-hidden bg-surface">
                                            <div className="aspect-video flex items-center justify-center text-text-secondary">
                                                <div className="text-center">
                                                    <Image size={32} className="mx-auto mb-2 opacity-50" />
                                                    <span className="text-xs">{screenshot}</span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-2 bg-surface-light/30 border-t border-border">
                                                <p className="text-xs text-text-secondary">Screenshot {index + 1}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-text-secondary">
                                    <Image size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No screenshots available</p>
                                </div>
                            )}
                            {plugin.demoVideo && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-text-primary mb-3">Demo Video</h3>
                                    <div className="aspect-video bg-surface rounded-lg border border-border flex items-center justify-center">
                                        <div className="text-center text-text-secondary">
                                            <Play size={40} className="mx-auto mb-2 opacity-50" />
                                            <span className="text-sm">Demo video: {plugin.demoVideo}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between bg-surface-light/30">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            plugin.price === 'free'
                                ? 'bg-success-500/10 text-success-500'
                                : 'bg-primary-500/10 text-primary-500'
                        )}>
                            {plugin.price === 'free' ? 'Free' : `$${plugin.price}`}
                        </span>
                        <span className="text-xs text-text-secondary">No hidden fees</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onInstall && onInstall(plugin, settings)}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-1.5"
                        >
                            <Download size={14} />
                            Install Plugin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PluginPreviewModal;
