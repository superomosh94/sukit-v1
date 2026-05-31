// src/components/settings/EditorSettings.jsx
import React, { useState } from 'react';
import { Code, Settings } from 'lucide-react';
import Button from '../shared/Button';

export const EditorSettings = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings || { theme: 'light', fontSize: 14, tabSize: 2, autoComplete: true });

  const handleChange = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Code className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-text-primary">Editor Settings</h3></div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Theme</label>
        <select className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.theme} onChange={e => handleChange('theme', e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Font Size (px)</label>
        <input type="number" className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.fontSize} onChange={e => handleChange('fontSize', Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Tab Size</label>
        <input type="number" className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.tabSize} onChange={e => handleChange('tabSize', Number(e.target.value))} />
      </div>
      <div className="flex items-center">
        <input type="checkbox" checked={local.autoComplete} onChange={e => handleChange('autoComplete', e.target.checked)} className="mr-2 rounded" />
        <span className="text-text-secondary">Enable Auto‑Complete</span>
      </div>
      <Button variant="primary" onClick={() => onSave?.(local)} fullWidth>Save Editor Settings</Button>
    </div>
  );
};

export default EditorSettings;
