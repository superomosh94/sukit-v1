import { useEffect, useState } from 'react';
import { Star, ThumbsUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { cn } from '../utils/cn';
export function ReviewsDashboard() {
  const [reviews, setR] = useState<any[]>([]);
  const [l, setL] = useState(true);
  useEffect(() => {
    reviewsApi.list().then((d) => {
      setR(d);
      setL(false);
    });
  }, []);
  const approved = reviews.filter((r) => r.status === 'APPROVED').length;
  const pending = reviews.filter((r) => r.status === 'PENDING').length;
  const spam = reviews.filter((r) => r.status === 'SPAM').length;
  const stats = [
    {
      label: 'Approved',
      value: approved,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: 'Pending',
      value: pending,
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
    { label: 'Spam', value: spam, icon: AlertTriangle, color: 'text-red-500' },
    {
      label: 'Total',
      value: reviews.length,
      icon: Star,
      color: 'text-blue-500',
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-gray-500 text-sm">
          Manage product and service reviews
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {reviews.slice(0, 5).map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
          >
            <div className="flex justify-between">
              <div className="font-medium">{r.title}</div>
              <span className="text-sm text-yellow-500">
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {r.content?.slice(0, 100)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-gray-400">by {r.userName}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  r.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : r.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                )}
              >
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
