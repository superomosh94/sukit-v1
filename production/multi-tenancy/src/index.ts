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

  // ─── Trial Period Management ──────────────────────────────────

  private trialTenants: Map<string, { startedAt: number; endsAt: number; plan: string }> = new Map();

  startTrial(tenantId: string, plan: string = 'pro', days: number = 14): { startedAt: string; endsAt: string; plan: string } {
    const trial = {
      startedAt: Date.now(),
      endsAt: Date.now() + days * 86400000,
      plan,
    };
    this.trialTenants.set(tenantId, trial);
    return { startedAt: new Date(trial.startedAt).toISOString(), endsAt: new Date(trial.endsAt).toISOString(), plan };
  }

  getTrialStatus(tenantId: string): { active: boolean; daysRemaining: number; plan: string } | null {
    const trial = this.trialTenants.get(tenantId);
    if (!trial) return null;
    const now = Date.now();
    if (now > trial.endsAt) {
      this.trialTenants.delete(tenantId);
      return { active: false, daysRemaining: 0, plan: trial.plan };
    }
    return { active: true, daysRemaining: Math.ceil((trial.endsAt - now) / 86400000), plan: trial.plan };
  }

  convertTrial(tenantId: string, planName: string): boolean {
    const trial = this.trialTenants.get(tenantId);
    if (!trial) return false;
    this.changePlan(tenantId, planName);
    this.trialTenants.delete(tenantId);
    return true;
  }

  extendTrial(tenantId: string, extraDays: number): boolean {
    const trial = this.trialTenants.get(tenantId);
    if (!trial) return false;
    trial.endsAt += extraDays * 86400000;
    return true;
  }

  // ─── Billing Portal ───────────────────────────────────────────

  generateBillingPortalConfig(): Record<string, any> {
    return {
      provider: 'stripe',
      apiKey: process.env.STRIPE_API_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      successUrl: 'https://app.sukit.dev/billing/success',
      cancelUrl: 'https://app.sukit.dev/billing/cancel',
      features: {
        customerPortal: true,
        invoicing: true,
        taxCalculation: true,
        paymentMethods: ['card', 'us_bank_account', 'sepa_debit'],
      },
      plans: this.config.plans.map(p => ({
        name: p.name,
        amount: p.price * 100,
        currency: 'usd',
        interval: 'month',
        features: p.features,
        trialDays: p.price > 0 ? 14 : 0,
      })),
    };
  }

  generateBillingPortalHtml(): string {
    return `import { useState, useEffect } from 'react';

export function BillingPortal({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.message || 'Failed to open portal');
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (data.success) window.location.reload();
    } catch (e) {
      setError('Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-portal">
      <h2>Billing & Subscription</h2>
      {error && <div className="error">{error}</div>}
      <button onClick={openPortal} disabled={loading}>
        {loading ? 'Loading...' : 'Manage Billing'}
      </button>
      <button onClick={cancelSubscription} disabled={loading} className="danger">
        Cancel Subscription
      </button>
    </div>
  );
}`;
  }

  generateInvoiceTemplate(): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, sans-serif; color: #333; margin: 0; padding: 40px; }
.invoice { max-width: 800px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; margin-bottom: 40px; }
.header h1 { color: #4F46E5; margin: 0; }
.meta { color: #666; margin-bottom: 30px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
th { background: #f5f5f5; text-align: left; padding: 12px; font-weight: 600; }
td { padding: 12px; border-bottom: 1px solid #eee; }
.total { text-align: right; font-size: 1.2em; font-weight: 600; }
.footer { margin-top: 40px; color: #999; font-size: 0.9em; }
</style></head><body>
<div class="invoice">
  <div class="header"><div><h1>{{companyName}}</h1><p>Invoice</p></div><div><p>#{{invoiceNumber}}</p><p>{{date}}</p></div></div>
  <div class="meta"><p><strong>Bill To:</strong><br>{{customerName}}<br>{{customerEmail}}</p></div>
  <table><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
  {{items}}
  </table>
  <div class="total">Total: ${{total}}</div>
  <div class="footer"><p>{{companyName}} - {{companyAddress}}<br>Terms: Net 30</p></div>
</div></body></html>`;
  }

  // ─── Setup Wizard ─────────────────────────────────────────────

  getSetupSteps(): { step: number; title: string; description: string; required: boolean }[] {
    return [
      { step: 1, title: 'Create Organization', description: 'Set up your organization name and URL', required: true },
      { step: 2, title: 'Invite Team Members', description: 'Add team members to collaborate', required: false },
      { step: 3, title: 'Choose a Template', description: 'Start with a pre-built site template', required: false },
      { step: 4, title: 'Connect Domain', description: 'Connect your custom domain', required: false },
      { step: 5, title: 'Configure Analytics', description: 'Set up analytics and tracking', required: false },
      { step: 6, title: 'Payment Setup', description: 'Configure your billing information', required: false },
      { step: 7, title: 'First Site', description: 'Create and publish your first site', required: true },
    ];
  }

  getSetupProgress(tenantId: string): { completed: number[]; pending: number[] } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return { completed: [], pending: [1, 2, 3, 4, 5, 6, 7] };
    const completed: number[] = tenant.settings?.setupCompleted || [];
    if (completed.length === 0) completed.push(1);
    const all = [1, 2, 3, 4, 5, 6, 7];
    return {
      completed,
      pending: all.filter(s => !completed.includes(s)),
    };
  }

  completeSetupStep(tenantId: string, step: number): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    if (!tenant.settings.setupCompleted) tenant.settings.setupCompleted = [];
    if (!tenant.settings.setupCompleted.includes(step)) {
      tenant.settings.setupCompleted.push(step);
    }
    return true;
  }

  isSetupComplete(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    return (tenant.settings?.setupCompleted?.length || 0) >= 7;
  }

  // ─── Database Schema Per Tenant ───────────────────────────────

  generateSchemaSql(tenantId: string): string {
    const schemaName = `tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `-- Schema: ${schemaName}
-- Auto-generated for tenant isolation
CREATE SCHEMA IF NOT EXISTS "${schemaName}";

-- Set search path for tenant
SET search_path TO "${schemaName}", public;

-- Migrate all tables to tenant schema
CREATE TABLE IF NOT EXISTS "${schemaName}".sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  host VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schemaName}".pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES "${schemaName}".sites(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schemaName}".media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  url TEXT,
  alt_text VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schemaName}".forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  fields JSONB DEFAULT '[]',
  submissions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security policies
ALTER TABLE "${schemaName}".sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE "${schemaName}".pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE "${schemaName}".media ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "${schemaName}".sites
  USING (true) WITH CHECK (true);`;
  }

  generateConnectionPoolConfig(tenantId: string): {
    poolSize: number;
    maxOverflow: number;
    poolTimeout: number;
    statementTimeout: number;
    idleTimeout: number;
    connectionString: string;
  } {
    const tenant = this.tenants.get(tenantId);
    const plan = this.config.plans.find(p => p.name.toLowerCase() === tenant?.plan) || this.config.plans[0];
    const size = plan.name === 'Enterprise' ? 25 : plan.name === 'Business' ? 15 : plan.name === 'Pro' ? 10 : 5;
    return {
      poolSize: size,
      maxOverflow: Math.ceil(size * 0.5),
      poolTimeout: 30000,
      statementTimeout: 30000,
      idleTimeout: 10000,
      connectionString: process.env.DATABASE_URL?.replace('public', `tenant_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}`) || '',
    };
  }

  generateSetupWizardHtml(): string {
    return `import { useState } from 'react';

const STEPS = [
  { id: 1, title: 'Organization', icon: '🏢' },
  { id: 2, title: 'Team', icon: '👥' },
  { id: 3, title: 'Template', icon: '🎨' },
  { id: 4, title: 'Domain', icon: '🌐' },
  { id: 5, title: 'Analytics', icon: '📊' },
  { id: 6, title: 'Billing', icon: '💳' },
  { id: 7, title: 'Launch', icon: '🚀' },
];

export function SetupWizard({ tenantId, onComplete }: { tenantId: string; onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const completeStep = async (step: number) => {
    setLoading(true);
    await fetch('/api/tenants/' + tenantId + '/setup/' + step, { method: 'POST' });
    setLoading(false);
    if (step < 7) setCurrentStep(step + 1);
    else onComplete();
  };

  const skipStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
    else onComplete();
  };

  return (
    <div className="setup-wizard">
      <div className="steps-bar">
        {STEPS.map(s => (
          <div key={s.id} className={'step ' + (s.id === currentStep ? 'active' : '') + (s.id < currentStep ? 'completed' : '')}>
            <span className="step-icon">{s.icon}</span>
            <span className="step-label">{s.title}</span>
          </div>
        ))}
      </div>
      <div className="step-content">
        <h2>Step {currentStep}: {STEPS[currentStep - 1].title}</h2>
        <div className="step-actions">
          <button onClick={() => completeStep(currentStep)} disabled={loading}>
            {loading ? 'Saving...' : 'Complete'}
          </button>
          <button onClick={skipStep} className="skip">Skip</button>
        </div>
      </div>
    </div>
  );
}`;
  }
}
