import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Plus, Trash2, Mail } from 'lucide-react';

const Team = () => {
    const { settings, updateSettings } = useSettingsStore();
    const team = settings.team || { members: [] };
    const [inviteEmail, setInviteEmail] = useState('');

    const update = (key, value) => updateSettings('team', { [key]: value });

    const addMember = () => {
        if (!inviteEmail.trim()) return;
        const newMembers = [...(team.members || []), { email: inviteEmail, role: 'editor', joinedAt: new Date().toISOString() }];
        update('members', newMembers);
        setInviteEmail('');
    };

    const removeMember = (index) => {
        const newMembers = team.members.filter((_, i) => i !== index);
        update('members', newMembers);
    };

    const updateRole = (index, role) => {
        const newMembers = [...team.members];
        newMembers[index] = { ...newMembers[index], role };
        update('members', newMembers);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Team</h2>
                <p className="text-sm text-text-secondary mt-1">Members, roles, invites</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Invite Member</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@email.com"
                            onKeyDown={(e) => e.key === 'Enter' && addMember()}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                            onClick={addMember}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Invite
                        </button>
                    </div>
                </div>

                {team.members && team.members.length > 0 ? (
                    <div className="space-y-2">
                        {team.members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{member.email}</p>
                                        <p className="text-xs text-text-secondary">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={member.role}
                                        onChange={(e) => updateRole(index, e.target.value)}
                                        className="px-2 py-1 bg-background border border-border rounded text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <button onClick={() => removeMember(index)} className="p-1 text-text-secondary hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary text-center py-4">No team members yet. Invite someone to get started.</p>
                )}
            </div>
        </div>
    );
};

export default Team;
