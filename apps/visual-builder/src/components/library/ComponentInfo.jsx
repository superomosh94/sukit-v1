import React from 'react';
import { Info, Package, Calendar, Download, Star, Users } from 'lucide-react';

export const ComponentInfo = ({ component, onClose }) => {
    if (!component) return null;

    const stats = {
        usage: Math.floor(Math.random() * 10000),
        downloads: Math.floor(Math.random() * 5000),
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 100)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-semibold text-text-primary">Component Info</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-surface-light">
                        <span className="text-2xl text-text-secondary">&times;</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">📦</span>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">{component.name}</h3>
                        <p className="text-sm text-text-secondary mt-1">v{component.version || '1.0.0'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface-light rounded-lg p-3 text-center">
                            <Package className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                            <p className="text-lg font-semibold text-text-primary">{stats.usage.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary">Total Uses</p>
                        </div>
                        <div className="bg-surface-light rounded-lg p-3 text-center">
                            <Download className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                            <p className="text-lg font-semibold text-text-primary">{stats.downloads.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary">Downloads</p>
                        </div>
                        <div className="bg-surface-light rounded-lg p-3 text-center">
                            <Star className="w-4 h-4 text-warning-500 mx-auto mb-1" />
                            <p className="text-lg font-semibold text-text-primary">{stats.rating}</p>
                            <p className="text-xs text-text-secondary">Rating ({stats.reviews})</p>
                        </div>
                        <div className="bg-surface-light rounded-lg p-3 text-center">
                            <Users className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                            <p className="text-lg font-semibold text-text-primary">1.2k</p>
                            <p className="text-xs text-text-secondary">Users</p>
                        </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2">Categories</h4>
                        <div className="flex gap-2">
                            <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-1 rounded">{component.category}</span>
                            <span className="text-xs bg-surface-light text-text-secondary px-2 py-1 rounded">React</span>
                            <span className="text-xs bg-surface-light text-text-secondary px-2 py-1 rounded">TypeScript</span>
                        </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2">Description</h4>
                        <p className="text-sm text-text-secondary">{component.description || 'A reusable component for SuKit visual builder.'}</p>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2">Installation</h4>
                        <pre className="bg-surface-light rounded p-2 text-xs text-text-secondary overflow-x-auto">
                            sukit add {component.name.toLowerCase()}
                        </pre>
                    </div>
                </div>
                
                <div className="flex gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            // Add to canvas
                            onClose();
                        }}
                        className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Use Component
                    </button>
                </div>
            </div>
        </div>
    );
};
