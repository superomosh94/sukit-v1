import React, { useState } from 'react';
import { Box, Search, Plus, Edit2, Trash2, Copy, Code, Star, Download } from 'lucide-react';
import { useComponentStore } from '../stores/componentStore';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';

const ComponentsManager = () => {
  const { components, customComponents, favorites, addCustomComponent, deleteCustomComponent, toggleFavorite } = useComponentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'custom', preview: '', code: '' });
  const [previewCode, setPreviewCode] = useState(null);

  const handleDelete = (id) => {
    deleteCustomComponent(id);
  };

  const allComponents = [
    ...(components || []),
    ...(customComponents || []).filter(cc => !(components || []).find(c => c.id === cc.id)),
  ];

  const filtered = allComponents.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = ['all', ...new Set(allComponents.map(c => c.category).filter(Boolean))];

  const handleSave = () => {
    addCustomComponent({
      id: `custom-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    });
    setShowModal(false);
    setFormData({ name: '', category: 'custom', preview: '', code: '' });
  };

  const handleExport = (component) => {
    const json = JSON.stringify(component, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name || 'component'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Components</h1>
          <p className="text-text-secondary mt-1">Browse and manage your custom components</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Component
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            aria-label="Search components"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(component => (
          <div key={component.id} className="bg-surface border border-border rounded-lg p-5 hover:shadow-lg transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <Box className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleFavorite(component.id)} className={`p-1.5 rounded hover:bg-surface-light ${favorites?.includes(component.id) ? 'text-yellow-500' : 'text-text-secondary'}`}>
                  <Star className="w-4 h-4" fill={favorites?.includes(component.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{component.name || 'Unnamed'}</h3>
            {component.preview && (
              <div className="text-xs text-text-secondary mb-3 font-mono bg-surface-light p-2 rounded overflow-hidden max-h-20">
                <pre className="truncate">{component.preview}</pre>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs bg-surface-light text-text-secondary px-2 py-1 rounded">{component.category || 'custom'}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreviewCode(component)} className="p-1.5 rounded hover:bg-surface-light" title="View Code">
                  <Code className="w-3.5 h-3.5 text-text-secondary" />
                </button>
                <button onClick={() => handleExport(component)} className="p-1.5 rounded hover:bg-surface-light" title="Export">
                  <Download className="w-3.5 h-3.5 text-text-secondary" />
                </button>
                <button onClick={() => handleDelete(component.id)} className="p-1.5 rounded hover:bg-danger-500/10" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Box className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-primary mb-1">No components found</p>
          <p className="text-sm text-text-secondary">Create your first custom component</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormData({ name: '', category: 'custom', preview: '', code: '' }); }} title="New Component" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Component Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary">
              <option value="custom">Custom</option>
              <option value="layout">Layout</option>
              <option value="form">Form</option>
              <option value="media">Media</option>
              <option value="data">Data</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Preview Markup</label>
            <textarea rows={3} value={formData.preview} onChange={(e) => setFormData({ ...formData, preview: e.target.value })} placeholder="<div>Your component preview HTML</div>" className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm resize-y" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Component Code</label>
            <textarea rows={8} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="// Your component code here" className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm resize-y" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">Create Component</Button>
        </div>
      </Modal>

      <Modal isOpen={!!previewCode} onClose={() => setPreviewCode(null)} title={previewCode?.name || 'Component Code'} size="lg">
        <pre className="bg-background border border-border rounded-lg p-4 text-sm text-text-primary overflow-auto max-h-96 font-mono">
          {previewCode?.code || previewCode?.preview || 'No code available'}
        </pre>
        <div className="mt-4">
          <Button variant="primary" onClick={() => setPreviewCode(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ComponentsManager;
