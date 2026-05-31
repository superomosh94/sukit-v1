import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Eye, MousePointerClick, TrendingUp, Calendar } from 'lucide-react';
import { popupApi, PopupAnalytics } from '../services/api';
import { cn } from '../utils/cn';

interface Props {
  popupId?: string;
  className?: string;
}

export function PopupAnalytics({ popupId, className }: Props) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<PopupAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    popupApi.getAnalytics(period).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [period]);

  if (loading) return <div className="p-4 text-gray-500">Loading analytics...</div>;
  if (!analytics) return null;

  const stats = [
    { label: 'Views', value: analytics.views, icon: Eye, color: 'text-blue-500' },
    { label: 'Conversions', value: analytics.conversions, icon: MousePointerClick, color: 'text-green-500' },
    { label: 'Conversion Rate', value: `${(analytics.conversionRate * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Popup Analytics</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <h4 className="text-sm font-medium mb-4">Daily Performance</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Views" />
            <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
