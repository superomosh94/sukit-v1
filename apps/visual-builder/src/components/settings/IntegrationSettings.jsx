// src/components/settings/IntegrationSettings.jsx
import React, { useState } from 'react';
import { Plug, Zap } from 'lucide-react';
import Button from '../shared/Button';

export const IntegrationSettings = ({ integrations = [], onAdd, onRemove, onSave }) => {
  const [local, setLocal] = useState(integrations);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  const handleAdd = () => {
    if (!newName) return;
    const newIntegration = { id: Date.now().toString(), name: newName, apiKey: newKey };
    const updated = [...local, newIntegration];
    setLocal(updated);
    onAdd?.(newIntegration);
    setNewName('');
    setNewKey('');
  };

  const handleRemove = (id) => {
    const updated = local.filter(i => i.id !== id);
    setLocal(updated);
    onRemove?.(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Plug className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-text-primary">Integration Settings</h3></div>
      <div className="space-y-3">
        {local.map(integ => (
          <div key={integ.id} className="flex items-center justify-between p-2 bg-surface border border-border rounded">
            <div>
              <p className="text-sm font-medium text-text-primary">{integ.name}</p>
              <p className="text-xs text-text-secondary">Key: {integ.apiKey || '—'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleRemove(integ.id)} leftIcon={<Zap className="w-4 h-4" />}>Remove</Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" placeholder="Integration name" value={newName} onChange={e => setNewName(e.target.value)} className="px-3 py-2 bg-surface border border-border rounded" />
        <input type="text" placeholder="API key (optional)" value={newKey} onChange={e => setNewKey(e.target.value)} className="px-3 py-2 bg-surface border border-border rounded" />
      </div>
      <Button variant="primary" onClick={handleAdd}>Add Integration</Button>
      <Button variant="primary" onClick={() => onSave?.(local)} fullWidth>Save Changes</Button>
    </div>
  );
};

export default IntegrationSettings;
