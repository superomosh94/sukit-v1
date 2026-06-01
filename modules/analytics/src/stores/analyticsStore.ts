import { create } from 'zustand';

interface MetricCard {
  label: string;
  value: number;
  change: number;
  icon: string;
}

interface ChartData {
  date: string;
  value: number;
  previous?: number;
}

interface UserActivityEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: string;
  entityName?: string;
  timestamp: string;
}

interface AnalyticsStore {
  dateRange: { from: Date | null; to: Date | null };
  metrics: MetricCard[];
  chartData: ChartData[];
  userActivity: UserActivityEntry[];
  selectedMetrics: string[];
  loading: boolean;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setMetrics: (metrics: MetricCard[]) => void;
  setChartData: (data: ChartData[]) => void;
  setUserActivity: (activity: UserActivityEntry[]) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  toggleMetric: (metric: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()((set, get) => ({
  dateRange: { from: null, to: null },
  metrics: [],
  chartData: [],
  userActivity: [],
  selectedMetrics: ['visitors', 'pageviews', 'bounceRate'],
  loading: false,
  setDateRange: (from, to) => set({ dateRange: { from, to } }),
  setMetrics: (metrics) => set({ metrics }),
  setChartData: (chartData) => set({ chartData }),
  setUserActivity: (userActivity) => set({ userActivity }),
  setSelectedMetrics: (selectedMetrics) => set({ selectedMetrics }),
  toggleMetric: (metric) => {
    const { selectedMetrics } = get();
    if (selectedMetrics.includes(metric)) {
      set({ selectedMetrics: selectedMetrics.filter((m) => m !== metric) });
    } else {
      set({ selectedMetrics: [...selectedMetrics, metric] });
    }
  },
  setLoading: (loading) => set({ loading }),
}));
