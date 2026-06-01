import { useEffect, useState } from 'react';
import {
  Plus,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  CreditCard,
  Award,
} from 'lucide-react';
import { membershipApi } from '../services/api';
import { cn } from '../utils/cn';

export function MembershipDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipApi.getAnalytics().then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: 'Total Members',
      value: analytics?.totalMembers || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active Subscriptions',
      value: analytics?.activeSubs || 0,
      icon: CreditCard,
      color: 'text-green-500',
    },
    {
      label: 'Total Points',
      value: analytics?.totalPoints || 0,
      icon: Award,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membership</h1>
        <p className="text-gray-500 text-sm">
          Manage members, plans, and engagement
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {analytics?.planBreakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Plan Distribution</h3>
          <div className="space-y-2">
            {analytics.planBreakdown.map((pb: any) => (
              <div
                key={pb.name}
                className="flex items-center justify-between text-sm"
              >
                <span>{pb.name}</span>
                <span className="font-medium">{pb.memberCount} members</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-8">
          Loading analytics...
        </div>
      )}
    </div>
  );
}
