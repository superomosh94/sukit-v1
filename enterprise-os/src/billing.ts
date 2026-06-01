import type { SukitKernel } from '@sukit/core';

type BillingPlan = 'starter' | 'growth' | 'enterprise' | 'custom';
type BillingPeriod = 'monthly' | 'yearly';
type MeteredUnit =
  | 'api-calls'
  | 'storage-gb'
  | 'bandwidth-gb'
  | 'seats'
  | 'sites';

interface PlanDefinition {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  limits: Record<string, number>;
  meteredFeatures: {
    unit: MeteredUnit;
    pricePerUnit: number;
    includedUnits: number;
  }[];
  tier: number;
}

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metered?: boolean;
}

interface Invoice {
  id: string;
  orgId: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  lines: InvoiceLine[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discounts: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paidAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

interface MeteredUsage {
  orgId: string;
  unit: MeteredUnit;
  consumed: number;
  included: number;
  overage: number;
  cost: number;
  period: string;
}

interface ResellerTier {
  name: string;
  minRevenue: number;
  commissionRate: number;
  supportLevel: 'basic' | 'premium' | 'enterprise';
  whiteLabel: boolean;
}

export class EnterpriseBilling {
  private kernel: SukitKernel;
  private plans: PlanDefinition[] = [];
  private invoices: Invoice[] = [];
  private usageRecords: Map<string, Map<string, number>> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.initPlans();
  }

  private initPlans(): void {
    this.plans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For small teams',
        price: { monthly: 29, yearly: 290 },
        features: ['10 sites', '50 pages/site', '1GB storage', 'Email support'],
        limits: {
          sites: 10,
          pages: 500,
          storage: 1,
          bandwidth: 10,
          members: 5,
        },
        meteredFeatures: [],
        tier: 1,
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For growing businesses',
        price: { monthly: 99, yearly: 990 },
        features: [
          '50 sites',
          '500 pages/site',
          '10GB storage',
          'Chat support',
          'Custom domains',
        ],
        limits: {
          sites: 50,
          pages: 25000,
          storage: 10,
          bandwidth: 100,
          members: 25,
        },
        meteredFeatures: [
          { unit: 'api-calls', pricePerUnit: 0.001, includedUnits: 10000 },
          { unit: 'storage-gb', pricePerUnit: 0.1, includedUnits: 10 },
        ],
        tier: 2,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: { monthly: 499, yearly: 4990 },
        features: [
          'Unlimited sites',
          'Unlimited pages',
          '100GB storage',
          '24/7 support',
          'SSO/SAML',
          'Audit logs',
          '99.99% SLA',
        ],
        limits: {
          sites: -1,
          pages: -1,
          storage: 100,
          bandwidth: 1000,
          members: 1000,
        },
        meteredFeatures: [
          { unit: 'api-calls', pricePerUnit: 0.0005, includedUnits: 100000 },
          { unit: 'storage-gb', pricePerUnit: 0.05, includedUnits: 100 },
          { unit: 'bandwidth-gb', pricePerUnit: 0.02, includedUnits: 1000 },
        ],
        tier: 3,
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Tailored for your needs',
        price: { monthly: 0, yearly: 0 },
        features: [
          'Everything in Enterprise',
          'Custom contracts',
          'Dedicated infra',
          'On-premise',
          'Custom SLA',
        ],
        limits: {
          sites: -1,
          pages: -1,
          storage: -1,
          bandwidth: -1,
          members: -1,
        },
        meteredFeatures: [],
        tier: 4,
      },
    ];
  }

  getPlans(): PlanDefinition[] {
    return this.plans;
  }

  getPlan(planId: string): PlanDefinition | undefined {
    return this.plans.find((p) => p.id === planId);
  }

  getUpgradeOptions(currentPlanId: string): PlanDefinition[] {
    const current = this.getPlan(currentPlanId);
    if (!current) return this.plans;
    return this.plans.filter((p) => p.tier > current.tier);
  }

  calculateUpgradePrice(
    fromPlan: string,
    toPlan: string,
    period: BillingPeriod
  ): { prorated: number; dueNow: number } {
    const from = this.getPlan(fromPlan);
    const to = this.getPlan(toPlan);
    if (!from || !to) return { prorated: 0, dueNow: 0 };
    const fromPrice = from.price[period];
    const toPrice = to.price[period];
    return { prorated: fromPrice, dueNow: toPrice - fromPrice };
  }

  recordUsage(orgId: string, unit: MeteredUnit, amount: number): void {
    const now = new Date();
    const periodKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (!this.usageRecords.has(orgId)) this.usageRecords.set(orgId, new Map());
    const orgUsage = this.usageRecords.get(orgId)!;
    const key = `${periodKey}:${unit}`;
    orgUsage.set(key, (orgUsage.get(key) || 0) + amount);
  }

  getMeteredUsage(
    orgId: string,
    planId: string,
    period: string
  ): MeteredUsage[] {
    const plan = this.getPlan(planId);
    if (!plan) return [];
    return plan.meteredFeatures.map((mf) => {
      const key = `${period}:${mf.unit}`;
      const consumed = this.usageRecords.get(orgId)?.get(key) || 0;
      const overage = Math.max(0, consumed - mf.includedUnits);
      return {
        orgId,
        unit: mf.unit,
        consumed,
        included: mf.includedUnits,
        overage,
        cost: overage * mf.pricePerUnit,
        period,
      };
    });
  }

  generateInvoice(
    orgId: string,
    planId: string,
    period: BillingPeriod
  ): Invoice {
    const plan = this.getPlan(planId);
    if (!plan) throw new Error('Invalid plan');

    const now = new Date();
    const periodStart =
      period === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1);
    const periodEnd =
      period === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
        : new Date(now.getFullYear(), 11, 31);
    const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const lines: InvoiceLine[] = [
      {
        description: `${plan.name} - ${period} (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
        quantity: 1,
        unitPrice: plan.price[period],
        total: plan.price[period],
      },
    ];

    const meteredUsage = this.getMeteredUsage(orgId, planId, periodKey);
    for (const mu of meteredUsage) {
      if (mu.overage > 0) {
        lines.push({
          description: `Overage: ${mu.unit} (${mu.overage} units @ $${mu.pricePerUnit.toFixed(4)})`,
          quantity: mu.overage,
          unitPrice: mu.pricePerUnit,
          total: mu.cost,
          metered: true,
        });
      }
    }

    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const taxRate = 0;
    const tax = 0;

    const invoice: Invoice = {
      id: `inv_${crypto.randomUUID().substring(0, 12)}`,
      orgId,
      number: `INV-${now.getFullYear()}-${String(this.invoices.length + 1).padStart(4, '0')}`,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      lines,
      subtotal,
      tax,
      taxRate,
      discounts: 0,
      total: subtotal + tax - 0,
      currency: 'USD',
      status: 'draft',
      paidAt: null,
      pdfUrl: null,
      createdAt: now.toISOString(),
    };
    this.invoices.push(invoice);
    return invoice;
  }

  getInvoices(orgId: string): Invoice[] {
    return this.invoices.filter((i) => i.orgId === orgId);
  }

  markPaid(invoiceId: string): void {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    }
  }

  // ─── Reseller (8.2) ─────────────────────────────────────────────

  private resellerTiers: ResellerTier[] = [
    {
      name: 'Silver',
      minRevenue: 0,
      commissionRate: 0.15,
      supportLevel: 'basic',
      whiteLabel: false,
    },
    {
      name: 'Gold',
      minRevenue: 5000,
      commissionRate: 0.25,
      supportLevel: 'premium',
      whiteLabel: true,
    },
    {
      name: 'Platinum',
      minRevenue: 25000,
      commissionRate: 0.35,
      supportLevel: 'enterprise',
      whiteLabel: true,
    },
  ];

  getResellerTiers(): ResellerTier[] {
    return this.resellerTiers;
  }

  getResellerTierForRevenue(revenue: number): ResellerTier {
    return (
      [...this.resellerTiers].reverse().find((t) => revenue >= t.minRevenue) ||
      this.resellerTiers[0]
    );
  }

  calculateCommission(
    resellerRevenue: number,
    tierName: string
  ): {
    revenue: number;
    commission: number;
    rate: number;
    nextTier: string | null;
  } {
    const tier = this.resellerTiers.find((t) => t.name === tierName);
    if (!tier)
      return {
        revenue: resellerRevenue,
        commission: 0,
        rate: 0,
        nextTier: null,
      };
    const commission = resellerRevenue * tier.commissionRate;
    const nextTier = this.resellerTiers.find(
      (t) => t.minRevenue > resellerRevenue
    );
    return {
      revenue: resellerRevenue,
      commission,
      rate: tier.commissionRate,
      nextTier: nextTier?.name || null,
    };
  }
}
