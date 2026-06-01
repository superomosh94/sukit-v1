'use client';

import { useState, useMemo } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  changes: Record<string, any> | null;
  ipAddress: string | null;
}

const SAMPLE_LOGS: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    userId: 'user_1',
    userName: 'Alice',
    action: 'site:create',
    resourceType: 'site',
    resourceId: 'site_123',
    changes: { name: 'My Blog' },
    ipAddress: '192.168.1.1',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    userId: 'user_2',
    userName: 'Bob',
    action: 'page:publish',
    resourceType: 'page',
    resourceId: 'page_456',
    changes: { slug: 'hello-world' },
    ipAddress: '10.0.0.1',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    userId: 'user_1',
    userName: 'Alice',
    action: 'module:install',
    resourceType: 'module',
    resourceId: '@sukit/seo',
    changes: { version: '1.2.0' },
    ipAddress: '192.168.1.1',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: null,
    userName: 'System',
    action: 'backup:complete',
    resourceType: 'backup',
    resourceId: 'backup_789',
    changes: { size: '2.4GB' },
    ipAddress: null,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 'user_3',
    userName: 'Carol',
    action: 'settings:update',
    resourceType: 'settings',
    resourceId: null,
    changes: { theme: 'dark' },
    ipAddress: '203.0.113.1',
  },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.action.toLowerCase().includes(q) &&
          !l.resourceType.toLowerCase().includes(q) &&
          !l.resourceId?.toLowerCase().includes(q)
        )
          return false;
      }
      if (actionFilter && l.action !== actionFilter) return false;
      if (userFilter && l.userName !== userFilter) return false;
      if (dateFrom && new Date(l.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(l.timestamp) > new Date(dateTo + 'T23:59:59'))
        return false;
      return true;
    });
  }, [logs, search, actionFilter, userFilter, dateFrom, dateTo]);

  const uniqueActions = useMemo(
    () => [...new Set(logs.map((l) => l.action))],
    [logs]
  );
  const uniqueUsers = useMemo(
    () => [...new Set(logs.filter((l) => l.userName).map((l) => l.userName!))],
    [logs]
  );

  const handleExport = () => {
    const data =
      exportFormat === 'json'
        ? JSON.stringify(filtered, null, 2)
        : [
            'Timestamp,User,Action,Resource Type,Resource ID,IP Address',
            ...filtered.map(
              (l) =>
                `"${l.timestamp}","${l.userName || 'System'}","${l.action}","${l.resourceType}","${l.resourceId || ''}","${l.ipAddress || ''}"`
            ),
          ].join('\n');
    const blob = new Blob([data], {
      type: exportFormat === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all actions and changes across your SUKIT instance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, resources..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Users</option>
            {uniqueUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filtered.length} of {logs.length} log entries
        </span>
        <span className="text-xs">Retention: 90 days</span>
      </div>

      <div className="space-y-1">
        {filtered.map((log) => (
          <div
            key={log.id}
            onClick={() => setSelectedLog(log)}
            className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all flex items-center gap-4"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 text-sm items-center">
              <span className="col-span-2 text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <span className="col-span-1 font-medium text-gray-700 truncate">
                {log.userName || 'System'}
              </span>
              <span className="col-span-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
                  {log.action}
                </span>
              </span>
              <span className="col-span-2 text-xs text-gray-500 truncate">
                {log.resourceType}
                {log.resourceId ? `:${log.resourceId.substring(0, 16)}` : ''}
              </span>
              <span className="col-span-3 text-xs text-gray-500 truncate">
                {log.changes
                  ? Object.entries(log.changes)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')
                  : '-'}
              </span>
              <span className="col-span-1 text-xs text-gray-400 truncate">
                {log.ipAddress || '-'}
              </span>
              <span className="col-span-1 text-right">
                <svg
                  className="w-4 h-4 text-gray-400 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No matching log entries found.
          </p>
        )}
      </div>

      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Log Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Timestamp</span>
                <span className="col-span-2">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">User</span>
                <span className="col-span-2">
                  {selectedLog.userName || 'System'}{' '}
                  {selectedLog.userId && `(${selectedLog.userId})`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Action</span>
                <span className="col-span-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {selectedLog.action}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">Resource</span>
                <span className="col-span-2">
                  {selectedLog.resourceType}
                  {selectedLog.resourceId ? ` / ${selectedLog.resourceId}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500">IP Address</span>
                <span className="col-span-2 font-mono text-xs">
                  {selectedLog.ipAddress || 'N/A'}
                </span>
              </div>
              {selectedLog.changes && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">Changes</span>
                  <pre className="col-span-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 w-full px-3 py-2 bg-gray-100 text-sm rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
