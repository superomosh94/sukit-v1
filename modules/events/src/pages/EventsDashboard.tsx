import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, CheckSquare } from 'lucide-react';
import { eventsApi } from '../services/api';
import { cn } from '../utils/cn';

export function EventsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    eventsApi.getAnalytics().then((d) => {
      setAnalytics(d);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: 'Total Events',
      value: analytics?.totalEvents || 0,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      label: 'Attendees',
      value: analytics?.totalAttendees || 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'Checked In',
      value: analytics?.checkedIn || 0,
      icon: CheckSquare,
      color: 'text-purple-500',
    },
    {
      label: 'Revenue',
      value: `$${analytics?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Manage events, tickets, and attendees
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
    </div>
  );
}
