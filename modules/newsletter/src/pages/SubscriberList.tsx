import { useEffect, useState } from 'react';
import { Search, Users, Download, Trash2 } from 'lucide-react';
import { newsletterApi } from '../services/api';
export function SubscriberList() {
  const [subs, setSubs] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [s, setS] = useState('');
  useEffect(() => {
    newsletterApi.listSubscribers().then((d) => {
      setSubs(d);
      setL(false);
    });
  }, []);
  const filtered = subs.filter(
    (x) => x.email?.includes(s) || x.name?.includes(s)
  );
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscribers</h1>
          <p className="text-gray-500 text-sm">
            {subs.length} total subscribers
          </p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={s}
          onChange={(e) => setS(e.target.value)}
          placeholder="Search subscribers..."
          className="w-full pl-8 p-2 border rounded text-sm"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="p-3 text-sm">{s.email}</td>
                <td className="p-3 text-sm">{s.name || '-'}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {s.subscribedAt?.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
