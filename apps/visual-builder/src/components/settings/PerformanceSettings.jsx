// src/components/settings/PerformanceSettings.jsx
import React, { useState } from 'react';
import { Gauge, Cpu, Zap } from 'lucide-react';
import Button from '../shared/Button';

export const PerformanceSettings = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings || { cacheTTL: 300, lazyLoadImages: true, enableCompression: true });
  const handleChange = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Gauge className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-text-primary">Performance Settings</h3></div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Cache TTL (seconds)</label>
        <input type="number" className="w-full px-3 py-2 bg-surface border border-border rounded-lg" value={local.cacheTTL} onChange={e => handleChange('cacheTTL', Number(e.target.value))} />
      </div>
      <div className="flex items-center">
        <input type="checkbox" checked={local.lazyLoadImages} onChange={e => handleChange('lazyLoadImages', e.target.checked)} className="mr-2 rounded" />
        <span className="text-text-secondary">Enable Lazy Load Images</span>
      </div>
      <div className="flex items-center">
        <input type="checkbox" checked={local.enableCompression} onChange={e => handleChange('enableCompression', e.target.checked)} className="mr-2 rounded" />
        <span className="text-text-secondary">Enable Asset Compression</span>
      </div>
      <Button variant="primary" onClick={() => onSave?.(local)} fullWidth>Save Performance Settings</Button>
    </div>
  );
};

export default PerformanceSettings;
