const API_BASE = '/api/popups';

export interface PopupData {
  id?: string;
  name: string;
  description?: string;
  popupType: string;
  triggerType: string;
  triggerValue?: string;
  animation: string;
  animationDuration: number;
  content: Record<string, any>;
  settings: Record<string, any>;
  pages: string[];
  devices: string[];
  status: string;
}

export interface PopupAnalytics {
  views: number;
  conversions: number;
  conversionRate: number;
  dailyData: { date: string; views: number; conversions: number }[];
}

export const popupApi = {
  async list(params?: { status?: string; type?: string; search?: string; limit?: number; offset?: number }): Promise<PopupData[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}${qs ? `?${qs}` : ''}`);
    return res.json();
  },

  async get(id: string): Promise<PopupData> {
    const res = await fetch(`${API_BASE}/${id}`);
    return res.json();
  },

  async create(data: PopupData): Promise<PopupData> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, data: Partial<PopupData>): Promise<PopupData> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  },

  async activate(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}/activate`, { method: 'POST' });
  },

  async pause(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}/pause`, { method: 'POST' });
  },

  async duplicate(id: string): Promise<PopupData> {
    const res = await fetch(`${API_BASE}/${id}/duplicate`, { method: 'POST' });
    return res.json();
  },

  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<PopupAnalytics> {
    const res = await fetch(`${API_BASE}/analytics?period=${period}`);
    return res.json();
  },

  async trackEvent(popupId: string, eventType: 'view' | 'conversion' | 'close'): Promise<void> {
    await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ popupId, eventType }),
    });
  },
};
