import { useEffect, useState } from 'react';
import { Search, Award, Mail, Trash2, Filter } from 'lucide-react';
import { membershipApi, MemberData } from '../services/api';
import { cn } from '../utils/cn';

export function MemberDirectory() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    const data = await membershipApi.listMembers({
      search,
      status: statusFilter || undefined,
    });
    setMembers(data.members);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [search, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Member Directory</h1>
          <p className="text-gray-500 text-sm">
            Browse and manage members ({total} total)
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or email..."
            className="w-full pl-8 p-2 border rounded text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="p-3 font-medium">Member</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Points</th>
                <th className="p-3 font-medium">Plan</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {m.name?.[0]}
                          </span>
                        </div>
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{m.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        {m.points || 0}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{m.planId || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium border',
                          m.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : m.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                        )}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
