'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [entries] = useState<
    {
      id: string;
      date: string;
      description: string;
      amount: number;
      status: string;
    }[]
  >([]);
  const [plan] = useState({ name: 'Free', price: 0, nextBilling: null });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
            </p>
          </div>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Change Plan
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Payment Methods
        </h3>
        <p className="text-sm text-gray-500">No payment methods saved.</p>
        <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
          + Add payment method
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Billing History
          </h3>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No billing history.
          </p>
        ) : (
          entries.map((e) => (
            <div
              key={e.id}
              className="px-4 py-3 border-b border-gray-100 flex justify-between text-sm"
            >
              <span>
                {new Date(e.date).toLocaleDateString()} &middot; {e.description}
              </span>
              <span className="font-medium">${e.amount.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
