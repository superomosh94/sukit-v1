import React, { useState, useEffect } from 'react';
import { Link, Plus, Trash2, ToggleLeft, ToggleRight, Search, Loader } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';

export const RedirectManager = ({ siteId }) => {
    const [redirects, setRedirects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newRedirect, setNewRedirect] = useState({ from: '', to: '', statusCode: 301, active: true });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!siteId) return;
        setLoading(true);
        setError('');
        api.getRedirects(siteId)
            .then((data) => setRedirects(Array.isArray(data) ? data : data?.redirects || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [siteId]);

    const filtered = redirects.filter(r =>
        r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.to.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async () => {
        if (!newRedirect.from.trim() || !newRedirect.to.trim()) return;
        try {
            const data = await api.createRedirect({ siteId, source: newRedirect.from, target: newRedirect.to, type: newRedirect.statusCode });
            setRedirects([...redirects, data]);
            setNewRedirect({ from: '', to: '', statusCode: 301, active: true });
            setShowAdd(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        const redirect = redirects.find(r => r.id === id);
        if (!redirect) return;
        try {
            await api.deleteRedirect({ siteId, source: redirect.from });
            setRedirects(redirects.filter(r => r.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleActive = (id) => {
        setRedirects(redirects.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Redirect Manager</h3>
            </div>
            <p className="text-sm text-text-secondary">Manage 301/302 redirects for your site</p>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search redirects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Redirect
                </button>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">From</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">To</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                            <th className="px-4 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((redirect) => (
                            <tr key={redirect.id} className="hover:bg-surface-light">
                                <td className="px-4 py-3 font-mono text-sm text-text-primary">/ {redirect.from}</td>
                                <td className="px-4 py-3 font-mono text-sm text-text-primary">/ {redirect.to}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                        redirect.statusCode === 301
                                            ? 'bg-primary-500/10 text-primary-500'
                                            : 'bg-warning-500/10 text-warning-500'
                                    )}>
                                        {redirect.statusCode}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleActive(redirect.id)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                                            redirect.active
                                                ? 'bg-success-500/10 text-success-500'
                                                : 'bg-surface-light text-text-secondary'
                                        )}
                                    >
                                        {redirect.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                        {redirect.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleDelete(redirect.id)}
                                        className="p-1.5 rounded hover:bg-danger-500/10"
                                    >
                                        <Trash2 className="w-4 h-4 text-danger-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <Link className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-primary mb-2">No redirects configured</p>
                    <p className="text-sm text-text-secondary">Add redirects to manage URL changes</p>
                </div>
            )}

            {/* Add Redirect Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-xl p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Add Redirect</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">From Path</label>
                                <input
                                    type="text"
                                    value={newRedirect.from}
                                    onChange={(e) => setNewRedirect({ ...newRedirect, from: e.target.value })}
                                    placeholder="/old-path"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">To Path</label>
                                <input
                                    type="text"
                                    value={newRedirect.to}
                                    onChange={(e) => setNewRedirect({ ...newRedirect, to: e.target.value })}
                                    placeholder="/new-path"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Status Code</label>
                                    <select
                                        value={newRedirect.statusCode}
                                        onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                                    >
                                        <option value={301}>301 (Permanent)</option>
                                        <option value={302}>302 (Temporary)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Status</label>
                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => setNewRedirect({ ...newRedirect, active: !newRedirect.active })}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${newRedirect.active ? 'bg-primary-500' : 'bg-surface-light'}`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${newRedirect.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                        </button>
                                        <span className="text-sm text-text-secondary">{newRedirect.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAdd(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                            >
                                Add Redirect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

RedirectManager.displayName = 'RedirectManager';
export default RedirectManager;
