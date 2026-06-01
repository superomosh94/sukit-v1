import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { bookingApi } from '../services/api';
import { cn } from '../utils/cn';

export function BookingDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getAnalytics().then((d) => {
      setAnalytics(d);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: 'Total Bookings',
      value: analytics?.total || 0,
      icon: CalendarCheck,
      color: 'text-blue-500',
    },
    {
      label: 'Confirmed',
      value: analytics?.confirmed || 0,
      icon: Clock,
      color: 'text-green-500',
    },
    {
      label: 'Cancelled',
      value: analytics?.cancelled || 0,
      icon: Clock,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Booking Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Manage services, appointments, and staff
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
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
      {loading && (
        <div className="text-center text-gray-500">Loading analytics...</div>
      )}
    </div>
  );
}
