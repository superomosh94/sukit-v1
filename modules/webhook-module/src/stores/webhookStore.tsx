import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface WebhookStore {
  webhooks: any[];
  setWebhooks: (w: any[]) => void;
  isLoading: boolean;
  setLoading: (b: boolean) => void;
}
export const useWebhookStore = create<WebhookStore>()(
  persist(
    (set) => ({
      webhooks: [],
      isLoading: false,
      setWebhooks: (w) => set({ webhooks: w }),
      setLoading: (b) => set({ isLoading: b }),
    }),
    { name: 'sukit-webhook-store' }
  )
);
