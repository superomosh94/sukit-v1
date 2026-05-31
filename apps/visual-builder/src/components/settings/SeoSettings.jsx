// src/components/settings/SeoSettings.jsx
import React, { useState } from 'react';
import { Search, Share2 } from 'lucide-react';
import Button from '../shared/Button';

export const SeoSettings = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings || { metaTitle: '', metaDescription: '', robots: 'index,follow' });
  const handleChange = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Search className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-text-primary">SEO Settings</h3></div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
        <input type="text" className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.metaTitle} onChange={e => handleChange('metaTitle', e.target.value)} placeholder="My Site Title" />
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
        <textarea className="w-full px-3 py-2 bg-surface border border-border rounded-lg" rows={3} value={local.metaDescription} onChange={e => handleChange('metaDescription', e.target.value)} placeholder="Brief description for search engines" />
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Robots Meta Tag</label>
        <select className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.robots} onChange={e => handleChange('robots', e.target.value)}>
          <option value="index,follow">Index, Follow</option>
          <option value="noindex,nofollow">No Index, No Follow</option>
        </select>
      </div>
      <Button variant="primary" onClick={() => onSave?.(local)} fullWidth>Save SEO Settings</Button>
    </div>
  );
};

export default SeoSettings;
