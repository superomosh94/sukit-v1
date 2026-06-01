import { useState } from 'react';
import { Search, CheckSquare, QrCode } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    checkedIn: boolean;
  }>;
  onCheckIn: (attendeeId: string) => Promise<void>;
}

export function CheckInPanel({ attendees, onCheckIn }: Props) {
  const [search, setSearch] = useState('');
  const filtered = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendee..."
          className="w-full pl-8 p-2 border rounded text-sm"
        />
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
          >
            <div>
              <span className="font-medium">{a.name}</span>
              <span className="text-gray-500 ml-2">{a.email}</span>
            </div>
            <button
              onClick={() => onCheckIn(a.id!)}
              disabled={a.checkedIn}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium',
                a.checkedIn
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              )}
            >
              {a.checkedIn ? (
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Checked In
                </span>
              ) : (
                'Check In'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
