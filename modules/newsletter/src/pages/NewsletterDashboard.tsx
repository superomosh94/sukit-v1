import { useEffect, useState } from 'react';
import { Mail, Users, BarChart3, Send } from 'lucide-react';
import { newsletterApi } from '../services/api';
import { cn } from '../utils/cn';
export function NewsletterDashboard() {
  const [a, setA] = useState<any>(null);
  const [l, setL] = useState(true);
  useEffect(() => {
    newsletterApi.getAnalytics().then((d) => {
      setA(d);
      setL(false);
    });
  }, []);
  const stats = [
    {
      label: 'Total Subscribers',
      value: a?.totalSubscribers || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active',
      value: a?.activeSubscribers || 0,
      icon: Mail,
      color: 'text-green-500',
    },
    {
      label: 'Sent Campaigns',
      value: a?.sentCampaigns || 0,
      icon: Send,
      color: 'text-purple-500',
    },
    {
      label: 'Total Opens',
      value: a?.totalOpens || 0,
      icon: BarChart3,
      color: 'text-yellow-500',
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <p className="text-gray-500 text-sm">
          Email campaigns, lists, and analytics
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
      {l && <div className="text-center text-gray-500">Loading...</div>}
    </div>
  );
}
