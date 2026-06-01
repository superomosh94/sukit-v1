'use client';

import { useState } from 'react';
import type { SubscriptionData } from '../types';

interface SubscriptionManagerProps {
  subscriptions: SubscriptionData[];
  onCancel: (id: string, atPeriodEnd: boolean) => Promise<void>;
  onPause: (id: string) => Promise<void>;
  onResume: (id: string) => Promise<void>;
  onChangePlan: (id: string, plan: 'monthly' | 'yearly') => Promise<void>;
  loading?: boolean;
}

export function SubscriptionManager({
  subscriptions,
  onCancel,
  onPause,
  onResume,
  onChangePlan,
  loading,
}: SubscriptionManagerProps) {
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {subscriptions.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No active subscriptions.
        </p>
      )}
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {sub.moduleName}
                </h4>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'past_due' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {sub.plan === 'monthly' ? 'Monthly' : 'Yearly'} billing &middot;
                Next payment:{' '}
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
              {sub.cancelAtPeriodEnd && (
                <p className="text-xs text-amber-600 mt-1">
                  Cancels at period end (
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()})
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                <>
                  <button
                    onClick={() =>
                      onChangePlan(
                        sub.id,
                        sub.plan === 'monthly' ? 'yearly' : 'monthly'
                      )
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Switch to {sub.plan === 'monthly' ? 'Yearly' : 'Monthly'}
                  </button>
                  <button
                    onClick={() => onPause(sub.id)}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Pause
                  </button>
                  {confirmCancel === sub.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onCancel(sub.id, true);
                          setConfirmCancel(null);
                        }}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmCancel(null)}
                        className="text-xs border px-2 py-1 rounded"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(sub.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
              {sub.status === 'past_due' && (
                <button
                  onClick={() => onResume(sub.id)}
                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
                >
                  Retry Payment
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span>Started: {new Date(sub.createdAt).toLocaleDateString()}</span>
            <span>
              Period: {new Date(sub.currentPeriodStart).toLocaleDateString()}{' '}
              &ndash; {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
