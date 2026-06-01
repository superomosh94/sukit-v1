import { useEffect, useState } from 'react';
import {
  Plus,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Search,
  Trash2,
} from 'lucide-react';
import { redirectApi } from '../services/api';
import { cn } from '../utils/cn';
export function RedirectDashboard() {
  const [redirs, setR] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [s, setS] = useState('');
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    source: '',
    target: '',
    type: 301,
    pattern: 'exact',
    active: true,
  });
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setR(await redirectApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await redirectApi.create(f);
    setF({ source: '', target: '', type: 301, pattern: 'exact', active: true });
    setSF(false);
    load();
  };
  const filtered = redirs.filter(
    (x) => x.source?.includes(s) || x.target?.includes(s)
  );
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Redirect Manager</h1>
          <p className="text-gray-500 text-sm">Manage URL redirects</p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Redirect
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={s}
          onChange={(e) => setS(e.target.value)}
          className="w-full pl-8 p-2 border rounded text-sm"
          placeholder="Search redirects..."
        />
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={f.source}
              onChange={(e) => setF({ ...f, source: e.target.value })}
              placeholder="Source URL"
              className="p-2 border rounded text-sm"
            />
            <input
              value={f.target}
              onChange={(e) => setF({ ...f, target: e.target.value })}
              placeholder="Target URL"
              className="p-2 border rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={f.type}
              onChange={(e) => setF({ ...f, type: Number(e.target.value) })}
              className="p-2 border rounded text-sm"
            >
              <option value={301}>301 Permanent</option>
              <option value={302}>302 Temporary</option>
              <option value={307}>307 Temporary</option>
              <option value={308}>308 Permanent</option>
            </select>
            <select
              value={f.pattern}
              onChange={(e) => setF({ ...f, pattern: e.target.value as any })}
              className="p-2 border rounded text-sm"
            >
              <option value="exact">Exact</option>
              <option value="wildcard">Wildcard</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Target</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Pattern</th>
              <th className="p-3 font-medium">Hits</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="p-3 text-sm font-mono">{r.source}</td>
                <td className="p-3 text-sm font-mono">{r.target}</td>
                <td className="p-3 text-sm">{r.type}</td>
                <td className="p-3 text-sm">{r.pattern}</td>
                <td className="p-3 text-sm">{r.hits}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium border',
                      r.active
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    )}
                  >
                    {r.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={async () => {
                      await redirectApi.delete(r.id!);
                      load();
                    }}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
