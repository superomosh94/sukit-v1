import { useEffect, useState } from 'react';
import { CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { membershipApi } from '../services/api';

export function SubscriptionsList() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    membershipApi.listSubscriptions().then(setSubs);
  }, []);

  const handleCancel = async (id: string) => {
    await membershipApi.cancelSubscription(id);
    setSubs(subs.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' } : s)));
  };

  if (!subs.length)
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No subscriptions found
      </div>
    );

  return (
    <div className="space-y-2">
      {subs.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border text-sm"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            <div>
              <span className="font-medium">Plan #{sub.planId}</span>
              <span className="ml-2 text-gray-500">Member #{sub.memberId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sub.status === 'ACTIVE' ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" />
                Cancelled
              </span>
            )}
            {sub.status === 'ACTIVE' && (
              <button
                onClick={() => handleCancel(sub.id!)}
                className="p-1 hover:bg-red-50 rounded text-red-500"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
