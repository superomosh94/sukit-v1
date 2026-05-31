// src/components/settings/TeamSettings.jsx
import React, { useState } from 'react';
import { Users, UserPlus, UserX } from 'lucide-react';
import Button from '../shared/Button';

export const TeamSettings = ({ members = [], onAddMember, onRemoveMember, onSave }) => {
  const [localMembers, setLocalMembers] = useState(members);
  const [newEmail, setNewEmail] = useState('');

  const handleAdd = () => {
    if (!newEmail) return;
    const newMember = { id: Date.now().toString(), email: newEmail, role: 'member' };
    const updated = [...localMembers, newMember];
    setLocalMembers(updated);
    onAddMember?.(newMember);
    setNewEmail('');
  };

  const handleRemove = (id) => {
    const updated = localMembers.filter(m => m.id !== id);
    setLocalMembers(updated);
    onRemoveMember?.(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-text-primary">Team Settings</h3></div>
      <div className="space-y-3">
        {localMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-surface border border-border rounded">
            <div>
              <p className="text-sm font-medium text-text-primary">{member.email}</p>
              <p className="text-xs text-text-secondary">{member.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleRemove(member.id)} leftIcon={<UserX className="w-4 h-4" />}>Remove</Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="email" placeholder="Invite by email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="flex-1 px-3 py-2 bg-surface border border-border rounded" />
        <Button variant="primary" onClick={handleAdd} leftIcon={<UserPlus className="w-4 h-4" />}>Invite</Button>
      </div>
      <Button variant="primary" onClick={() => onSave?.(localMembers)} fullWidth>Save Changes</Button>
    </div>
  );
};

export default TeamSettings;
