import type { SukitKernel } from '@sukit/core';

export interface TenantConfig {
  isolation: 'schema' | 'row' | 'database';
  maxSitesPerTenant: number;
  maxPagesPerSite: number;
  maxStorageGB: number;
  maxBandwidthGB: number;
  maxApiRequests: number;
  maxTeamMembers: number;
  maxCustomDomains: number;
  plans: TenantPlan[];
}

export interface TenantPlan {
  name: string;
  price: number;
  sites: number;
  pages: number;
  storageGB: number;
  bandwidthGB: number;
  teamMembers: number;
  customDomains: number;
  features: string[];
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  members: { userId: string; role: 'owner' | 'admin' | 'member' }[];
  settings: Record<string, any>;
  createdAt: string;
}

const DEFAULT_PLANS: TenantPlan[] = [
  {
    name: 'Free',
    price: 0,
    sites: 1,
    pages: 10,
    storageGB: 1,
    bandwidthGB: 5,
    teamMembers: 1,
    customDomains: 0,
    features: ['Core modules', 'Community support'],
  },
  {
    name: 'Pro',
    price: 29,
    sites: 10,
    pages: 100,
    storageGB: 10,
    bandwidthGB: 50,
    teamMembers: 5,
    customDomains: 3,
    features: ['All modules', 'Email support', 'Custom domains', 'Export'],
  },
  {
    name: 'Business',
    price: 99,
    sites: 50,
    pages: 500,
    storageGB: 100,
    bandwidthGB: 500,
    teamMembers: 25,
    customDomains: 10,
    features: [
      'Everything in Pro',
      'Priority support',
      'Team collaboration',
      'SSO',
      'Audit logs',
    ],
  },
  {
    name: 'Enterprise',
    price: 499,
    sites: -1,
    pages: -1,
    storageGB: 1000,
    bandwidthGB: 5000,
    teamMembers: -1,
    customDomains: -1,
    features: [
      'Everything in Business',
      '24/7 support',
      'On-premise',
      'SAML/SSO',
      'Custom SLA',
      'Dedicated infra',
    ],
  },
];

export class MultiTenancy {
  private kernel: SukitKernel;
  private config: TenantConfig;
  private tenants: Map<string, Tenant> = new Map();

  constructor(kernel: SukitKernel, config?: Partial<TenantConfig>) {
    this.kernel = kernel;
    this.config = {
      isolation: 'row',
      maxSitesPerTenant: 10,
      maxPagesPerSite: 100,
      maxStorageGB: 10,
      maxBandwidthGB: 50,
      maxApiRequests: 5000,
      maxTeamMembers: 5,
      maxCustomDomains: 3,
      plans: DEFAULT_PLANS,
      ...config,
    };
  }

  createTenant(name: string, userId: string, plan?: string): Tenant {
    const id = `org_${crypto.randomUUID().substring(0, 12)}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const tenant: Tenant = {
      id,
      name,
      slug,
      plan: plan || 'free',
      members: [{ userId, role: 'owner' }],
      settings: {},
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  addMember(
    tenantId: string,
    userId: string,
    role: 'admin' | 'member' = 'member'
  ): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant || tenant.members.length >= this.config.maxTeamMembers)
      return false;
    tenant.members.push({ userId, role });
    return true;
  }

  removeMember(tenantId: string, userId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    const ownerCount = tenant.members.filter((m) => m.role === 'owner').length;
    const target = tenant.members.find((m) => m.userId === userId);
    if (!target || (target.role === 'owner' && ownerCount <= 1)) return false;
    tenant.members = tenant.members.filter((m) => m.userId !== userId);
    return true;
  }

  getUserRole(tenantId: string, userId: string): string | null {
    return (
      this.tenants.get(tenantId)?.members.find((m) => m.userId === userId)
        ?.role || null
    );
  }

  getTenantForUser(userId: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find((t) =>
      t.members.some((m) => m.userId === userId)
    );
  }

  checkResourceLimit(
    tenantId: string,
    resource:
      | 'sites'
      | 'pages'
      | 'storage'
      | 'bandwidth'
      | 'api'
      | 'members'
      | 'domains'
  ): { allowed: boolean; current: number; limit: number } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return { allowed: false, current: 0, limit: 0 };
    const plan =
      this.config.plans.find((p) => p.name.toLowerCase() === tenant.plan) ||
      this.config.plans[0];
    const limits: Record<string, { current: number; limit: number }> = {
      sites: { current: 0, limit: plan.sites },
      pages: { current: 0, limit: plan.pages },
      storage: { current: 0, limit: plan.storageGB },
      bandwidth: { current: 0, limit: plan.bandwidthGB },
      api: { current: 0, limit: this.config.maxApiRequests },
      members: { current: tenant.members.length, limit: plan.teamMembers },
      domains: { current: 0, limit: plan.customDomains },
    };
    const r = limits[resource];
    return {
      allowed: r.limit < 0 || r.current < r.limit,
      current: r.current,
      limit: r.limit,
    };
  }

  getUsage(tenantId: string): Record<string, { used: number; limit: number }> {
    const resources = [
      'sites',
      'pages',
      'storage',
      'bandwidth',
      'api',
      'members',
      'domains',
    ];
    return resources.reduce(
      (acc, r) => {
        const { current, limit } = this.checkResourceLimit(tenantId, r as any);
        acc[r] = { used: current, limit };
        return acc;
      },
      {} as Record<string, { used: number; limit: number }>
    );
  }

  changePlan(tenantId: string, planName: string): boolean {
    const plan = this.config.plans.find(
      (p) => p.name.toLowerCase() === planName.toLowerCase()
    );
    if (!plan) return false;
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    tenant.plan = planName.toLowerCase();
    return true;
  }

  getPlans(): TenantPlan[] {
    return this.config.plans;
  }

  setStoragePrefix(tenantId: string): string {
    return `tenants/${tenantId}/`;
  }

  setCachePrefix(tenantId: string): string {
    return `tenant:${tenantId}:`;
  }

  getTenantIdFromHost(host: string): string | null {
    for (const [id, tenant] of this.tenants) {
      if (host.startsWith(tenant.slug) || host.includes(tenant.slug)) return id;
    }
    return null;
  }
}
