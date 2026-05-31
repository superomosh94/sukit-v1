import React, { useState } from 'react';
import { Key, Plus, Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

const ApiKeys = () => {
    const { apiKeys, createApiKey, revokeApiKey } = useUserStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);

    const handleCreateKey = () => {
        if (newKeyName.trim()) {
            const newKey = createApiKey(newKeyName);
            setNewlyCreatedKey(newKey);
            setNewKeyName('');
            setTimeout(() => setNewlyCreatedKey(null), 10000);
            setShowCreateModal(false);
        }
    };

    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">API Keys</h3>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create API Key
                </button>
            </div>

            {/* Newly Created Key Alert */}
            {newlyCreatedKey && (
                <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">API Key Created Successfully</p>
                            <p className="text-xs text-text-secondary mt-1">
                                Make sure to copy your API key now. You won't be able to see it again!
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <code className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono text-primary-500">
                                    {newlyCreatedKey.key}
                                </code>
                                <button
                                    onClick={() => handleCopyKey(newlyCreatedKey.key)}
                                    className="p-1 rounded hover:bg-surface-light transition-colors"
                                >
                                    {copiedKey === newlyCreatedKey.key ? (
                                        <Check className="w-4 h-4 text-success-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-text-secondary" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys List */}
            <div className="space-y-3">
                {apiKeys?.length === 0 ? (
                    <div className="bg-surface border border-border rounded-lg p-8 text-center">
                        <Key className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                        <p className="text-text-primary mb-1">No API keys yet</p>
                        <p className="text-sm text-text-secondary">Create your first API key to get started</p>
                    </div>
                ) : (
                    apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="bg-surface border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-medium text-text-primary">{apiKey.name}</p>
                                    <p className="text-xs text-text-secondary">Created: {formatDate(apiKey.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopyKey(apiKey.key)}
                                        className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                                        title="Copy API Key"
                                    >
                                        {copiedKey === apiKey.key ? (
                                            <Check className="w-4 h-4 text-success-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-text-secondary" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => revokeApiKey(apiKey.id)}
                                        className="p-2 rounded-lg hover:bg-danger-500/10 transition-colors"
                                        title="Revoke API Key"
                                    >
                                        <Trash2 className="w-4 h-4 text-danger-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-background rounded p-2 font-mono text-xs text-text-secondary break-all">
                                {apiKey.key}
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Last used: {formatDate(apiKey.lastUsed)}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Create API Key Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-semibold text-text-primary">Create API Key</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-surface-light">
                                <span className="text-2xl text-text-secondary">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Key Name</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g., Production API Key"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    autoFocus
                                />
                            </div>
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-text-secondary">
                                        This key will only be shown once. Make sure to copy and save it securely.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-border">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKey}
                                disabled={!newKeyName.trim()}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                Create Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiKeys;
