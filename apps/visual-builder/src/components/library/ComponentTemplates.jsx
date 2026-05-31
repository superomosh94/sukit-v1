import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Copy, Download, Upload } from 'lucide-react';

export const ComponentTemplates = ({ onSelect, onAdd }) => {
    const [templates, setTemplates] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [selectedComponent, setSelectedComponent] = useState(null);

    useEffect(() => {
        // Load templates from localStorage
        const stored = localStorage.getItem('sukit-component-templates');
        if (stored) {
            setTemplates(JSON.parse(stored));
        }
    }, []);

    const saveTemplate = () => {
        if (!templateName.trim() || !selectedComponent) return;
        
        const newTemplate = {
            id: Date.now().toString(),
            name: templateName,
            component: selectedComponent,
            createdAt: new Date().toISOString()
        };
        
        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('sukit-component-templates', JSON.stringify(updated));
        
        setTemplateName('');
        setSelectedComponent(null);
        setShowSaveModal(false);
    };

    const deleteTemplate = (id) => {
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        localStorage.setItem('sukit-component-templates', JSON.stringify(updated));
    };

    const exportTemplate = (template) => {
        const data = JSON.stringify(template, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.sukit-template.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importTemplate = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const template = JSON.parse(event.target.result);
                const updated = [...templates, template];
                setTemplates(updated);
                localStorage.setItem('sukit-component-templates', JSON.stringify(updated));
            } catch (error) {
                console.error('Invalid template file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Component Templates</h3>
                <div className="flex gap-2">
                    <label className="cursor-pointer">
                        <input type="file" accept=".json" onChange={importTemplate} className="hidden" />
                        <button className="p-1.5 rounded hover:bg-surface-light" title="Import Template">
                            <Upload className="w-4 h-4 text-text-secondary" />
                        </button>
                    </label>
                </div>
            </div>
            
            {templates.length === 0 ? (
                <div className="text-center py-8">
                    <Save className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">No saved templates</p>
                    <p className="text-xs text-text-secondary mt-1">Save a component as template to reuse it</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg hover:border-primary-500 transition-colors group">
                            <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(template.component)}>
                                <p className="font-medium text-text-primary">{template.name}</p>
                                <p className="text-xs text-text-secondary">{template.component.type}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onAdd?.(template.component.type)} className="p-1.5 rounded hover:bg-surface-light" title="Add to Canvas">
                                    <Copy className="w-3.5 h-3.5 text-text-secondary" />
                                </button>
                                <button onClick={() => exportTemplate(template)} className="p-1.5 rounded hover:bg-surface-light" title="Export">
                                    <Download className="w-3.5 h-3.5 text-text-secondary" />
                                </button>
                                <button onClick={() => deleteTemplate(template.id)} className="p-1.5 rounded hover:bg-danger-500/10" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Save Template Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-semibold text-text-primary">Save as Template</h2>
                            <button onClick={() => setShowSaveModal(false)} className="p-1 rounded hover:bg-surface-light">
                                <span className="text-2xl text-text-secondary">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Template Name</label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="My Custom Button"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    autoFocus
                                />
                            </div>
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                                <p className="text-xs text-text-secondary">
                                    This will save the selected component as a reusable template.
                                    You can use it in any project.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-border">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveTemplate}
                                disabled={!templateName.trim()}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
