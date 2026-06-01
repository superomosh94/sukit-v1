'use client';

import { useState } from 'react';
import type { PayoutSummary, PayoutData } from '../types';

interface PayoutDashboardProps {
  summary: PayoutSummary | null;
  onRequestPayout: () => Promise<void>;
  onUpdateMethod: (method: { type: string; email: string }) => Promise<void>;
  requesting?: boolean;
}

export function PayoutDashboard({
  summary,
  onRequestPayout,
  onUpdateMethod,
  requesting,
}: PayoutDashboardProps) {
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [methodType, setMethodType] = useState('stripe');
  const [methodEmail, setMethodEmail] = useState('');

  if (!summary) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  async function handleUpdateMethod() {
    await onUpdateMethod({ type: methodType, email: methodEmail });
    setShowMethodForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-green-600">
            ${summary.pendingAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Revenue Share</p>
          <p className="text-2xl font-bold text-gray-900">
            {(summary.revenueShare * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {summary.pendingAmount >= summary.minimumPayout && (
        <button
          onClick={onRequestPayout}
          disabled={requesting}
          className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {requesting
            ? 'Requesting...'
            : `Request Payout ($${summary.pendingAmount.toFixed(2)})`}
        </button>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Payout History
          </h3>
          <button
            onClick={() => setShowMethodForm(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Update Method
          </button>
        </div>
        <div className="space-y-2">
          {summary.payouts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  ${p.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.periodStart).toLocaleDateString()} &ndash;{' '}
                  {new Date(p.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'sent' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                >
                  {p.status}
                </span>
                {p.sentAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.sentAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
          {summary.payouts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No payouts yet.
            </p>
          )}
        </div>
      </div>

      {showMethodForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Update Payout Method
            </h3>
            <div className="space-y-3 mb-4">
              <select
                value={methodType}
                onChange={(e) => setMethodType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="stripe">Stripe Connect</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <input
                type="email"
                value={methodEmail}
                onChange={(e) => setMethodEmail(e.target.value)}
                placeholder="Email for {methodType} account"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateMethod}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setShowMethodForm(false)}
                className="px-3 py-2 border text-sm rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
