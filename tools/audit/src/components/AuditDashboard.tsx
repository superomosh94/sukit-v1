'use client';

import { useState, useEffect } from 'react';

interface AuditEvent {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  timestamp: string;
}

interface Stats {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByResource: Record<string, number>;
  oldestEvent: string | null;
  newestEvent: string | null;
}

export function AuditDashboard() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/audit');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.logs || []);
          setStats(data.stats || null);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return <div className="p-4 text-gray-400">Loading audit log...</div>;

  const filtered = filter
    ? events.filter(
        (e) =>
          e.action?.toLowerCase().includes(filter.toLowerCase()) ||
          e.userId?.toLowerCase().includes(filter.toLowerCase()) ||
          e.resourceType?.toLowerCase().includes(filter.toLowerCase())
      )
    : events;

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Events" value={stats.totalEvents} />
          <StatCard
            label="Unique Actions"
            value={Object.keys(stats.eventsByAction).length}
          />
          <StatCard
            label="Resources"
            value={Object.keys(stats.eventsByResource).length}
          />
          <StatCard
            label="Time Span"
            value={
              stats.oldestEvent
                ? daysBetween(stats.oldestEvent, stats.newestEvent!) + 'd'
                : 'N/A'
            }
          />
        </div>
      )}

      <input
        type="text"
        placeholder="Filter by action, user, or resource..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left py-2 px-3">Timestamp</th>
              <th className="text-left py-2 px-3">User</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Resource</th>
              <th className="text-left py-2 px-3">IP</th>
              <th className="text-left py-2 px-3">Changes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="py-2 px-3 text-gray-300">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-gray-300">
                  {e.userId || 'system'}
                </td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded bg-gray-700 text-xs">
                    {e.action}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-400">
                  {e.resourceType}
                  {e.resourceId ? `/${e.resourceId.substring(0, 8)}` : ''}
                </td>
                <td className="py-2 px-3 text-gray-400">
                  {e.ipAddress || '-'}
                </td>
                <td className="py-2 px-3 text-gray-400">
                  {e.changes
                    ? Object.keys(e.changes).slice(0, 2).join(', ')
                    : '-'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No audit events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded border border-gray-700 bg-gray-900">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}
