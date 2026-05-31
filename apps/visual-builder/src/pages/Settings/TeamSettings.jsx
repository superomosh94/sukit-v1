import React, { useState } from 'react';
import { Users, Plus, Mail, Trash2, Crown, Edit, Save, X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const TeamSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [members, setMembers] = useState(settings.team?.members || [
        { id: 1, email: 'owner@example.com', name: 'John Doe', role: 'owner', avatar: null, joinedAt: '2024-01-15' },
        { id: 2, email: 'admin@example.com', name: 'Jane Smith', role: 'admin', avatar: null, joinedAt: '2024-01-16' },
        { id: 3, email: 'member@example.com', name: 'Bob Johnson', role: 'member', avatar: null, joinedAt: '2024-02-01' },
    ]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [editingRole, setEditingRole] = useState(null);

    const roles = [
        { value: 'owner', label: 'Owner', description: 'Full access', color: 'text-warning-500' },
        { value: 'admin', label: 'Admin', description: 'Manage team and settings', color: 'text-primary-500' },
        { value: 'member', label: 'Member', description: 'Create and edit projects', color: 'text-success-500' },
        { value: 'viewer', label: 'Viewer', description: 'View only', color: 'text-secondary-500' },
    ];

    const handleInvite = () => {
        if (inviteEmail) {
            const newMember = {
                id: Date.now(),
                email: inviteEmail,
                name: inviteEmail.split('@')[0],
                role: inviteRole,
                joinedAt: new Date().toISOString().slice(0, 10),
            };
            setMembers([...members, newMember]);
            setInviteEmail('');
            setInviteRole('member');
            setShowInviteModal(false);
            updateSettings('team', { members: [...members, newMember] });
        }
    };

    const handleRemoveMember = (id) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            setMembers(members.filter(m => m.id !== id));
            updateSettings('team', { members: members.filter(m => m.id !== id) });
        }
    };

    const handleUpdateRole = (id, newRole) => {
        setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
        updateSettings('team', { members: members.map(m => m.id === id ? { ...m, role: newRole } : m) });
        setEditingRole(null);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-warning-500" />;
            case 'admin': return <Users className="w-4 h-4 text-primary-500" />;
            default: return <Users className="w-4 h-4 text-text-secondary" />;
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">Team Settings</h3>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>
            
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {members.map(member => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-semibold">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-primary">{member.name}</div>
                                            <div className="text-xs text-text-secondary">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingRole === member.id ? (
                                        <select
                                            className="text-sm bg-surface border border-border rounded px-2 py-1"
                                            value={member.role}
                                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                        >
                                            {roles.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            {getRoleIcon(member.role)}
                                            <span className="capitalize">{member.role}</span>
                                            {member.role !== 'owner' && (
                                                <button onClick={() => setEditingRole(member.id)} className="p-1 hover:text-text-primary"><Edit className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {member.joinedAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {member.role !== 'owner' && (
                                        <button onClick={() => handleRemoveMember(member.id)} className="text-danger hover:text-danger-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-6 w-full max-w-md border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">Invite Team Member</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input 
                                        type="email" 
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary" 
                                        placeholder="colleague@example.com" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Role</label>
                                <select 
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                                >
                                    {roles.map(r => (
                                        <option key={r.value} value={r.value}>{r.label} - {r.description}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleInvite} className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamSettings;
