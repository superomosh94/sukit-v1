'use client';

import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { TeamMember, PermissionOverride } from '../types';

interface PermissionOverridesProps {
  member: TeamMember;
  siteId: string;
  className?: string;
}

export function PermissionOverrides({
  member,
  siteId,
  className,
}: PermissionOverridesProps) {
  const updateMemberRole = useSiteManagerStore((s) => s.updateMemberRole);
  const [overrides, setOverrides] = useState<PermissionOverride[]>(
    member.permissions ?? []
  );
  const [editing, setEditing] = useState(false);

  const permissions = [
    { key: 'canEdit' as const, label: 'Edit' },
    { key: 'canDelete' as const, label: 'Delete' },
    { key: 'canPublish' as const, label: 'Publish' },
  ];

  const handleToggle = (permKey: keyof PermissionOverride) => {
    setOverrides((prev) => {
      if (!prev.length) {
        return [
          {
            pageId: undefined,
            canEdit: permKey === 'canEdit',
            canDelete: permKey === 'canDelete',
            canPublish: permKey === 'canPublish',
          },
        ];
      }
      return prev.map((o) => ({
        ...o,
        [permKey]: !o[permKey],
      }));
    });
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Permission Overrides</h4>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-primary hover:underline"
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="space-y-2">
        {permissions.map(({ key, label }) => {
          const enabled = overrides.length > 0 ? overrides[0][key] : false;
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <button
                onClick={() => editing && handleToggle(key)}
                disabled={!editing}
                className={cn(
                  'flex items-center gap-1 rounded px-2 py-0.5 text-xs',
                  enabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  !editing && 'cursor-default'
                )}
              >
                {enabled ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {enabled ? 'Allowed' : 'Denied'}
              </button>
            </div>
          );
        })}
      </div>
      {editing && (
        <button
          onClick={async () => {
            await updateMemberRole(member.id, member.role);
            setEditing(false);
          }}
          className="mt-3 w-full rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground"
        >
          Save Overrides
        </button>
      )}
    </div>
  );
}
