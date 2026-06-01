import React, { useState } from 'react';
import { Users, UserPlus, Settings, Shield } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastActive?: Date;
}

export interface TeamDashboardProps {
  members: TeamMember[];
  onInvite: (email: string, role: string) => void;
  onRemoveMember: (id: string) => void;
  onChangeRole: (id: string, role: string) => void;
}

export function TeamDashboard({
  members,
  onInvite,
  onRemoveMember,
  onChangeRole,
}: TeamDashboardProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} />
          <h3 className="text-sm font-semibold">
            Team Members ({members.length})
          </h3>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={14} />
          <span>Invite</span>
        </button>
      </div>

      {showInvite && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-md"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="author">Author</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            onClick={() => {
              if (inviteEmail) {
                onInvite(inviteEmail, inviteRole);
                setInviteEmail('');
                setShowInvite(false);
              }
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send Invite
          </button>
        </div>
      )}

      <div className="space-y-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {member.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <select
              value={member.role}
              onChange={(e) => onChangeRole(member.id, e.target.value)}
              className="px-2 py-1 text-xs bg-muted border border-border rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={() => onRemoveMember(member.id)}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
            >
              <span className="text-xs">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
