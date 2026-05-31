'use client';

import { useState } from 'react';
import { Users, UserPlus, Mail, Shield, Trash2, Crown, X } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { TeamRole, TeamMember } from '../types';

const ROLE_OPTIONS: { value: TeamRole; label: string; description: string }[] =
  [
    { value: 'owner', label: 'Owner', description: 'Full control' },
    { value: 'admin', label: 'Admin', description: 'Manage team and content' },
    {
      value: 'editor',
      label: 'Editor',
      description: 'Create and edit content',
    },
    { value: 'viewer', label: 'Viewer', description: 'View only' },
  ];

export function TeamManager() {
  const [showInvite, setShowInvite] = useState(false);
  const team = useSiteManagerStore((s) => s.team);
  const removeMember = useSiteManagerStore((s) => s.removeMember);
  const updateMemberRole = useSiteManagerStore((s) => s.updateMemberRole);

  const owner = team.find((m) => m.role === 'owner');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Team ({team.length})</h3>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <UserPlus className="size-3.5" />
          Invite
        </button>
      </div>

      {team.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No team members yet
        </p>
      ) : (
        <div className="space-y-1">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-md border bg-card p-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {member.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {member.email}
                </p>
              </div>
              {member.role === 'owner' ? (
                <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  <Crown className="size-3" />
                  Owner
                </span>
              ) : (
                <select
                  value={member.role}
                  onChange={(e) =>
                    updateMemberRole(member.id, e.target.value as TeamRole)
                  }
                  className="h-7 rounded border bg-background px-2 text-[10px]"
                >
                  {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
              {member.role !== 'owner' && (
                <button
                  onClick={() => {
                    if (confirm('Remove this member?')) removeMember(member.id);
                  }}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showInvite && <InviteDialog onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('editor');
  const inviteMember = useSiteManagerStore((s) => s.inviteMember);

  const handleInvite = () => {
    if (!email.trim()) return;
    const siteId = useSiteManagerStore.getState().currentSiteId;
    if (siteId) {
      inviteMember(siteId, email.trim(), role);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-96 rounded-lg border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Invite Team Member</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
              placeholder="colleague@example.com"
              type="email"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
            >
              {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} - {r.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInvite}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            Send Invite
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
