'use client';

import { useCallback, useState } from 'react';

export function useBackupIntegration() {
  const [backups, setBackups] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const loadBackups = useCallback(async (siteId: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/backups`);
      const data = await res.json();
      setBackups(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const createBackup = useCallback(async (siteId: string, label?: string) => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      setBackups((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Backup creation failed:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const restoreBackup = useCallback(
    async (siteId: string, backupId: string) => {
      try {
        await fetch(`/api/sites/${siteId}/backups/${backupId}/restore`, {
          method: 'POST',
        });
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return { backups, isCreating, loadBackups, createBackup, restoreBackup };
}
