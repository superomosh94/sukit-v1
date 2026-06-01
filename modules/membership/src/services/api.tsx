const API_BASE = '/api/membership';

export interface PlanData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features: string[];
  status: string;
  trialDays?: number;
}

export interface MemberData {
  id?: string;
  name: string;
  email: string;
  planId?: string;
  points?: number;
  status: string;
  avatar?: string;
  bio?: string;
}

export interface SubscriptionData {
  id?: string;
  memberId: string;
  planId: string;
  status: string;
}

export interface BadgeData {
  id?: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  criteria?: string;
}

export const membershipApi = {
  async listPlans(params?: { status?: string }): Promise<PlanData[]> {
    const qs = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    const r = await fetch(`${API_BASE}/plans${qs}`);
    return r.json();
  },

  async getPlan(id: string): Promise<PlanData> {
    const r = await fetch(`${API_BASE}/plans/${id}`);
    return r.json();
  },

  async createPlan(data: PlanData): Promise<PlanData> {
    const r = await fetch(`${API_BASE}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async updatePlan(id: string, data: Partial<PlanData>): Promise<PlanData> {
    const r = await fetch(`${API_BASE}/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async deletePlan(id: string): Promise<void> {
    await fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' });
  },

  async listMembers(params?: {
    search?: string;
    planId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ members: MemberData[]; total: number }> {
    const qs = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined)
          ) as any
        ).toString()
      : '';
    const r = await fetch(`${API_BASE}/members${qs}`);
    return r.json();
  },

  async getMember(id: string): Promise<MemberData> {
    const r = await fetch(`${API_BASE}/members/${id}`);
    return r.json();
  },

  async createMember(data: MemberData): Promise<MemberData> {
    const r = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async updateMember(
    id: string,
    data: Partial<MemberData>
  ): Promise<MemberData> {
    const r = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async deleteMember(id: string): Promise<void> {
    await fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' });
  },

  async listSubscriptions(params?: {
    status?: string;
  }): Promise<SubscriptionData[]> {
    const qs = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    const r = await fetch(`${API_BASE}/subscriptions${qs}`);
    return r.json();
  },

  async createSubscription(data: SubscriptionData): Promise<SubscriptionData> {
    const r = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async cancelSubscription(id: string): Promise<void> {
    await fetch(`${API_BASE}/subscriptions/${id}/cancel`, { method: 'POST' });
  },

  async listBadges(): Promise<BadgeData[]> {
    const r = await fetch(`${API_BASE}/badges`);
    return r.json();
  },

  async createBadge(data: BadgeData): Promise<BadgeData> {
    const r = await fetch(`${API_BASE}/badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.json();
  },

  async assignBadge(memberId: string, badgeId: string): Promise<void> {
    await fetch(`${API_BASE}/badges/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, badgeId }),
    });
  },

  async getLeaderboard(period?: string): Promise<MemberData[]> {
    const qs = period ? `?period=${period}` : '';
    const r = await fetch(`${API_BASE}/leaderboard${qs}`);
    return r.json();
  },

  async grantPoints(
    memberId: string,
    points: number,
    reason: string
  ): Promise<void> {
    await fetch(`${API_BASE}/points/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, points, reason }),
    });
  },

  async getAnalytics(): Promise<any> {
    const r = await fetch(`${API_BASE}/analytics`);
    return r.json();
  },
};
