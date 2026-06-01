import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StoredPlan {
  id: string;
  type: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features: string[];
  status: string;
  trialDays?: number;
  sortOrder?: number;
  createdAt: Date;
}

interface StoredMember {
  id: string;
  type: string;
  name: string;
  email: string;
  planId?: string;
  points?: number;
  status: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

interface StoredSubscription {
  id: string;
  type: string;
  memberId: string;
  planId: string;
  status: string;
  startedAt: Date;
  cancelledAt?: Date;
  createdAt: Date;
}

interface StoredBadge {
  id: string;
  type: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  criteria?: string;
  createdAt: Date;
}

const store: {
  plans: StoredPlan[];
  members: StoredMember[];
  subscriptions: StoredSubscription[];
  badges: StoredBadge[];
  pointsTxns: any[];
} = {
  plans: [],
  members: [],
  subscriptions: [],
  badges: [],
  pointsTxns: [],
};
let nextId = 1;

export class MembershipController {
  async listPlans(query?: { status?: string }) {
    let result = store.plans;
    if (query?.status) result = result.filter((p) => p.status === query.status);
    return result;
  }

  async getPlan(id: string) {
    const plan = store.plans.find((p) => p.id === id);
    if (!plan) throw new Error('Plan not found');
    return plan;
  }

  async createPlan(data: any) {
    const plan: StoredPlan = {
      id: String(nextId++),
      type: 'plan',
      name: data.name,
      description: data.description,
      price: data.price || 0,
      interval: data.interval || 'month',
      features: data.features || [],
      status: data.status || 'ACTIVE',
      trialDays: data.trialDays,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date(),
    };
    store.plans.push(plan);
    return plan;
  }

  async updatePlan(id: string, data: any) {
    const idx = store.plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    store.plans[idx] = { ...store.plans[idx], ...data };
    return store.plans[idx];
  }

  async deletePlan(id: string) {
    const idx = store.plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    store.plans.splice(idx, 1);
    return { success: true };
  }

  async listMembers(query: {
    search?: string;
    planId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let result = store.members;
    if (query.search)
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(query.search!.toLowerCase()) ||
          m.email?.toLowerCase().includes(query.search!.toLowerCase())
      );
    if (query.planId) result = result.filter((m) => m.planId === query.planId);
    if (query.status) result = result.filter((m) => m.status === query.status);
    const total = result.length;
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    return { members: result.slice(offset, offset + limit), total };
  }

  async getMember(id: string) {
    const member = store.members.find((m) => m.id === id);
    if (!member) throw new Error('Member not found');
    return member;
  }

  async createMember(data: any) {
    const member: StoredMember = {
      id: String(nextId++),
      type: 'member',
      name: data.name,
      email: data.email,
      planId: data.planId,
      points: 0,
      status: data.status || 'ACTIVE',
      avatar: data.avatar,
      bio: data.bio,
      createdAt: new Date(),
    };
    store.members.push(member);
    return member;
  }

  async updateMember(id: string, data: any) {
    const idx = store.members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Member not found');
    store.members[idx] = { ...store.members[idx], ...data };
    return store.members[idx];
  }

  async deleteMember(id: string) {
    const idx = store.members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Member not found');
    store.members.splice(idx, 1);
    return { success: true };
  }

  async listSubscriptions(query?: { status?: string }) {
    let result = store.subscriptions;
    if (query?.status) result = result.filter((s) => s.status === query.status);
    return result;
  }

  async createSubscription(data: any) {
    const sub: StoredSubscription = {
      id: String(nextId++),
      type: 'subscription',
      memberId: data.memberId,
      planId: data.planId,
      status: 'ACTIVE',
      startedAt: new Date(),
      createdAt: new Date(),
    };
    store.subscriptions.push(sub);
    return sub;
  }

  async cancelSubscription(id: string) {
    const idx = store.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    store.subscriptions[idx].status = 'CANCELLED';
    store.subscriptions[idx].cancelledAt = new Date();
    return store.subscriptions[idx];
  }

  async listBadges() {
    return store.badges;
  }

  async createBadge(data: any) {
    const badge: StoredBadge = {
      id: String(nextId++),
      type: 'badge',
      name: data.name,
      icon: data.icon || 'Award',
      color: data.color || 'yellow',
      description: data.description,
      criteria: data.criteria,
      createdAt: new Date(),
    };
    store.badges.push(badge);
    return badge;
  }

  async assignBadge(memberId: string, badgeId: string) {
    const txn = {
      id: String(nextId++),
      type: 'badge-assignment',
      memberId,
      badgeId,
      assignedAt: new Date(),
    };
    store.pointsTxns.push(txn);
    return txn;
  }

  async getLeaderboard(period?: string) {
    return [...store.members]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 50);
  }

  async grantPoints(memberId: string, points: number, reason: string) {
    const idx = store.members.findIndex((m) => m.id === memberId);
    if (idx === -1) throw new Error('Member not found');
    store.members[idx].points = (store.members[idx].points || 0) + points;
    const txn = {
      id: String(nextId++),
      type: 'points-transaction',
      memberId,
      points,
      reason,
      createdAt: new Date(),
    };
    store.pointsTxns.push(txn);
    return store.members[idx];
  }

  async getAnalytics() {
    const totalMembers = store.members.length;
    const activeSubs = store.subscriptions.filter(
      (s) => s.status === 'ACTIVE'
    ).length;
    const totalPoints = store.members.reduce(
      (sum, m) => sum + (m.points || 0),
      0
    );
    const planBreakdown = store.plans.map((p) => ({
      name: p.name,
      memberCount: store.members.filter((m) => m.planId === p.id).length,
    }));
    return { totalMembers, activeSubs, totalPoints, planBreakdown };
  }
}
