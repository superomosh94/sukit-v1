'use client';

import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '../utils/cn';

interface PageLock {
  pageId: string;
  userId: string;
  userName: string;
  lockedAt: string;
}

interface PageLockIndicatorProps {
  pageId: string;
  siteId: string;
  currentUserId: string;
  className?: string;
}

export function PageLockIndicator({
  pageId,
  siteId,
  currentUserId,
  className,
}: PageLockIndicatorProps) {
  const [lock, setLock] = useState<PageLock | null>(null);

  useEffect(() => {
    const checkLock = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}/pages/${pageId}/lock`);
        const data = await res.json();
        setLock(data);
      } catch {}
    };
    checkLock();
    const interval = setInterval(checkLock, 10000);
    return () => clearInterval(interval);
  }, [pageId, siteId]);

  const isLockedByMe = lock?.userId === currentUserId;
  const isLockedByOther = lock && !isLockedByMe;

  if (!lock) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-md px-2 py-1 text-xs',
        isLockedByOther
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        className
      )}
    >
      {isLockedByOther ? (
        <Lock className="size-3" />
      ) : (
        <Unlock className="size-3" />
      )}
      <span>
        {isLockedByOther
          ? `Locked by ${lock.userName}`
          : 'You have this page locked'}
      </span>
    </div>
  );
}
