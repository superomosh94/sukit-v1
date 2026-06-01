'use client';

import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  currentPage?: string;
}

interface CollisionPresenceProps {
  siteId: string;
  className?: string;
}

export function CollisionPresence({
  siteId,
  className,
}: CollisionPresenceProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}/presence`);
        const data = await res.json();
        setCollaborators(data);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [siteId]);

  if (!collaborators.length) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex -space-x-1.5">
        {collaborators.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="relative flex size-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium text-white"
            style={{ backgroundColor: user.color }}
            title={`${user.name}${user.currentPage ? ` - ${user.currentPage}` : ''}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {collaborators.length > 5 && (
        <span className="text-[10px] text-muted-foreground">
          +{collaborators.length - 5}
        </span>
      )}
    </div>
  );
}
