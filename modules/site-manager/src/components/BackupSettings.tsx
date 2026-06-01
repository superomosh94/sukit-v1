'use client';

import { useState } from 'react';
import { HardDrive, Save } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

interface BackupSettingsProps {
  siteId: string;
  className?: string;
}

export function BackupSettings({ siteId, className }: BackupSettingsProps) {
  const updateSite = useSiteManagerStore((s) => s.updateSite);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'manual'>(
    'daily'
  );
  const [retentionDays, setRetentionDays] = useState(30);
  const [storage, setStorage] = useState<'local' | 's3' | 'r2'>('local');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateSite(siteId, {
      settings: {
        backups: { enabled: true, frequency, retentionDays, storage },
      },
    } as any);
    setSaving(false);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Backup Settings</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Save className="size-3" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Retention
          </label>
          <input
            type="number"
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            min={1}
            max={365}
            className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Storage
          </label>
          <select
            value={storage}
            onChange={(e) => setStorage(e.target.value as any)}
            className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            <option value="local">Local</option>
            <option value="s3">S3</option>
            <option value="r2">Cloudflare R2</option>
          </select>
        </div>
      </div>
    </div>
  );
}
