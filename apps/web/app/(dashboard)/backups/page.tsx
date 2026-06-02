'use client';

import { useState, useEffect } from 'react';

interface BackupEntry {
  id: string;
  type: string;
  size: number;
  status: string;
  createdBy: string;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + ' MB';
  if (bytes >= 1_000) return (bytes / 1_000).toFixed(1) + ' KB';
  return bytes + ' B';
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  useEffect(() => {
    fetch('/api/sites')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.sites || [];
        setSites(list);
        if (list.length > 0) setSelectedSiteId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSiteId) return;
    fetch(`/api/sites/${selectedSiteId}/backups`)
      .then((r) => r.json())
      .then((data) => setBackups(Array.isArray(data) ? data : []))
      .catch(() => setBackups([]));
  }, [selectedSiteId]);

  async function createBackup() {
    if (!selectedSiteId) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`/api/sites/${selectedSiteId}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'manual' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create backup');
      }
      const backup = await res.json();
      setBackups((prev) => [backup, ...prev]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function restoreBackup(backupId: string) {
    if (!selectedSiteId) return;
    setRestoring(backupId);
    setError('');
    try {
      const res = await fetch(
        `/api/sites/${selectedSiteId}/backups/${backupId}/restore`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Restore failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRestoring(null);
    }
  }

  async function deleteBackup(backupId: string) {
    if (!selectedSiteId) return;
    setDeleting(backupId);
    setError('');
    try {
      const res = await fetch(
        `/api/sites/${selectedSiteId}/backups/${backupId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
      setBackups((prev) => prev.filter((b) => b.id !== backupId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  const lastBackup = backups[0];

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
          disabled={creating || !selectedSiteId}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ Create Backup'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sites.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Site:</label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Total Backups</span>
          <p className="font-medium mt-0.5">{backups.length}</p>
        </div>
        <div>
          <span className="text-gray-500">Latest Size</span>
          <p className="font-medium mt-0.5">
            {lastBackup ? formatSize(lastBackup.size) : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Last backup</span>
          <p className="font-medium mt-0.5">
            {lastBackup
              ? new Date(lastBackup.createdAt).toLocaleString()
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
                {new Date(b.createdAt).toLocaleString()} &middot;{' '}
                {formatSize(b.size)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  b.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : b.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {b.status}
              </span>
              <a
                href={`/api/sites/${selectedSiteId}/backups/${b.id}/download`}
                className="text-xs text-gray-600 hover:text-gray-800"
                download
              >
                Download
              </a>
              <button
                onClick={() => restoreBackup(b.id)}
                disabled={restoring === b.id}
                className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                {restoring === b.id ? 'Restoring...' : 'Restore'}
              </button>
              <button
                onClick={() => deleteBackup(b.id)}
                disabled={deleting === b.id}
                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deleting === b.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {backups.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No backups yet. Select a site and create your first backup.
          </p>
        )}
      </div>
    </div>
  );
}
