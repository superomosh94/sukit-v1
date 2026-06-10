'use client';

import { useEffect } from 'react';
import { useMpesaStore } from '../stores/mpesaStore';

interface TransactionListProps {
  siteId: string;
  limit?: number;
}

export function TransactionList({ siteId, limit = 20 }: TransactionListProps) {
  const { transactions, loading, setLoading, setTransactions, setError, lastError } = useMpesaStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mpesa/transactions?siteId=${siteId}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [siteId, limit]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No M-Pesa transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4 font-medium">Receipt</th>
            <th className="py-2 pr-4 font-medium">Phone</th>
            <th className="py-2 pr-4 font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, limit).map((txn) => (
            <tr key={txn.id} className="border-b last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">
                {txn.mpesaReceiptNumber || '-'}
              </td>
              <td className="py-2 pr-4">{txn.phoneNumber}</td>
              <td className="py-2 pr-4">
                {txn.currency} {txn.amount.toLocaleString()}
              </td>
              <td className="py-2 pr-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    txn.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-700'
                      : txn.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : txn.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {txn.status}
                </span>
              </td>
              <td className="py-2 text-muted-foreground">
                {new Date(txn.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
