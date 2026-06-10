import { create } from 'zustand';
import type { MpesaTransactionRecord } from '../types';

interface MpesaStoreState {
  transactions: MpesaTransactionRecord[];
  loading: boolean;
  lastError: string | null;
  polling: Record<string, ReturnType<typeof setInterval>>;

  setTransactions: (txns: MpesaTransactionRecord[]) => void;
  addTransaction: (txn: MpesaTransactionRecord) => void;
  updateTransaction: (id: string, updates: Partial<MpesaTransactionRecord>) => void;
  setLoading: (v: boolean) => void;
  setError: (err: string | null) => void;

  startPolling: (checkoutRequestId: string, onUpdate: (txn: MpesaTransactionRecord) => void) => void;
  stopPolling: (checkoutRequestId: string) => void;
}

export const useMpesaStore = create<MpesaStoreState>((set, get) => ({
  transactions: [],
  loading: false,
  lastError: null,
  polling: {},

  setTransactions: (txns) => set({ transactions: txns }),
  addTransaction: (txn) => set((s) => ({ transactions: [txn, ...s.transactions] })),
  updateTransaction: (id, updates) =>
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  setLoading: (v) => set({ loading: v }),
  setError: (err) => set({ lastError: err }),

  startPolling: (checkoutRequestId, onUpdate) => {
    const existing = get().polling[checkoutRequestId];
    if (existing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestId }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.transaction) {
          onUpdate(data.transaction);
          if (data.transaction.status !== 'PENDING') {
            get().stopPolling(checkoutRequestId);
          }
        }
      } catch {
        // polling errors are silent — next interval will retry
      }
    }, 3000);

    set((s) => ({ polling: { ...s.polling, [checkoutRequestId]: interval } }));
  },

  stopPolling: (checkoutRequestId) => {
    const interval = get().polling[checkoutRequestId];
    if (interval) {
      clearInterval(interval);
      set((s) => {
        const next = { ...s.polling };
        delete next[checkoutRequestId];
        return { polling: next };
      });
    }
  },
}));
