'use client';

import { useState } from 'react';

export default function BackupsPage() {
  const [backups, setBackups] = useState<
    {
      id: string;
      type: string;
      size: string;
      createdAt: string;
      status: string;
    }[]
  >([]);
  const [creating, setCreating] = useState(false);

  async function createBackup() {
    setCreating(true);
    const res = await fetch('/api/marketplace/backup/default');
    const data = await res.json();
    setBackups((prev) => [
      {
        id: data.backupId,
        type: 'full',
        size: '0 B',
        createdAt: new Date().toISOString(),
        status: 'completed',
      },
      ...prev,
    ]);
    setCreating(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Backup and restore your sites and data.
          </p>
        </div>
        <button
          onClick={createBackup}
          disabled={creating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ Create Backup'}
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Auto-backup</span>
          <p className="font-medium mt-0.5">Daily at 2 AM</p>
        </div>
        <div>
          <span className="text-gray-500">Retention</span>
          <p className="font-medium mt-0.5">30 days</p>
        </div>
        <div>
          <span className="text-gray-500">Last backup</span>
          <p className="font-medium mt-0.5">
            {backups[0]
              ? new Date(backups[0].createdAt).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {backups.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {b.type} backup
              </p>
              <p className="text-xs text-gray-500">
                {new Date(b.createdAt).toLocaleString()} &middot; {b.size}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {b.status}
              </span>
              <button className="text-xs text-indigo-600 hover:text-indigo-800">
                Restore
              </button>
              <button className="text-xs text-red-600 hover:text-red-800">
                Delete
              </button>
            </div>
          </div>
        ))}
        {backups.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No backups yet. Create your first backup.
          </p>
        )}
      </div>
    </div>
  );
}
