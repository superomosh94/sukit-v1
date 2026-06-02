'use client';

import { useState, useEffect } from 'react';

interface SubscriptionData {
  id: string;
  module: { moduleId: string; name: string };
  plan: string;
  status: string;
  amount: number;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  module: { name: string };
  receiptUrl?: string;
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/marketplace/subscriptions').then((r) => r.json()),
      fetch('/api/marketplace/billing').then((r) => r.json()),
    ])
      .then(([subs, billing]) => {
        setSubscriptions(Array.isArray(subs) ? subs : []);
        const entries = billing?.entries || [];
        setTransactions(entries);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'active'
  );
  const pastDueSubscriptions = subscriptions.filter(
    (s) => s.status === 'past_due'
  );
  const totalMonthly = activeSubscriptions.reduce((sum, s) => {
    return s.plan === 'yearly' ? sum + s.amount / 12 : sum + s.amount;
  }, 0);

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/marketplace/billing/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {pastDueSubscriptions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium">Payment Required</span>
            <span className="text-sm text-red-500">
              {pastDueSubscriptions.length} subscription
              {pastDueSubscriptions.length > 1 ? 's' : ''}{' '}
              {pastDueSubscriptions.length > 1 ? 'have' : 'has'} a failed
              payment.
            </span>
          </div>
          <button
            onClick={openCustomerPortal}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Update payment method
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Subscriptions</p>
            <h2 className="text-xl font-bold text-gray-900">
              {activeSubscriptions.length > 0
                ? `${activeSubscriptions.length} subscription${activeSubscriptions.length > 1 ? 's' : ''}`
                : 'Free'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalMonthly > 0
                ? `$${totalMonthly.toFixed(2)}/mo`
                : 'No active payments'}
            </p>
          </div>
          <button
            onClick={openCustomerPortal}
            disabled={portalLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {portalLoading ? 'Loading...' : 'Manage Billing'}
          </button>
        </div>

        {activeSubscriptions.length > 0 && (
          <div className="mt-4 space-y-2">
            {activeSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sub.module.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sub.plan === 'yearly' ? 'Yearly' : 'Monthly'} &middot; $
                    {sub.amount.toFixed(2)}/
                    {sub.plan === 'yearly' ? 'yr' : 'mo'} &middot;
                    {sub.cancelAtPeriodEnd
                      ? 'Cancels ' +
                        new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : 'Renews ' +
                        new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Payment Methods
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Manage your payment methods through the Stripe Customer Portal.
        </p>
        <button
          onClick={openCustomerPortal}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Manage payment methods &rarr;
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Billing History
          </h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No billing history.
          </p>
        ) : (
          <div>
            {transactions.map((t) => (
              <div
                key={t.id}
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-sm"
              >
                <div>
                  <span className="text-gray-900 font-medium">
                    {t.module.name}
                  </span>
                  <span className="text-gray-400 mx-1">&middot;</span>
                  <span className="text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                  {t.receiptUrl && (
                    <>
                      <span className="text-gray-400 mx-1">&middot;</span>
                      <a
                        href={t.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Receipt
                      </a>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${t.amount.toFixed(2)}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      t.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : t.status === 'refunded'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
