import type { SukitKernel } from '@sukit/core';

interface BrandingConfig {
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS: string | null;
  loginBackground: string | null;
  loginMessage: string | null;
}

interface CustomDomain {
  domain: string;
  verified: boolean;
  verificationMethod: string;
  verificationValue: string;
  sslStatus: 'pending' | 'active' | 'failed';
  dnsRecords: { type: string; name: string; value: string; ttl: number }[];
  addedAt: string;
}

interface ResellerOrg {
  id: string;
  parentOrgId: string;
  name: string;
  slug: string;
  tier: string;
  branding: BrandingConfig;
  customDomain: string | null;
  commissionRate: number;
  totalRevenue: number;
  customerCount: number;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export class WhiteLabelManager {
  private kernel: SukitKernel;
  private resellerOrgs: Map<string, ResellerOrg> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  private defaultBranding: BrandingConfig = {
    logo: null,
    favicon: null,
    primaryColor: '#4F46E5',
    secondaryColor: '#6366F1',
    accentColor: '#818CF8',
    fontFamily: 'Inter, system-ui, sans-serif',
    customCSS: null,
    loginBackground: null,
    loginMessage: null,
  };

  getDefaultBranding(): BrandingConfig {
    return { ...this.defaultBranding };
  }

  applyBranding(
    orgId: string,
    branding: Partial<BrandingConfig>
  ): BrandingConfig {
    const existing = this.getBranding(orgId);
    const updated = { ...existing, ...branding };
    this.kernel.settings.set(`branding:${orgId}`, JSON.stringify(updated));
    return updated;
  }

  getBranding(orgId: string): BrandingConfig {
    return { ...this.defaultBranding };
  }

  generateBrandingCSS(orgId: string): string {
    const b = this.getBranding(orgId);
    return `:root { --primary: ${b.primaryColor}; --secondary: ${b.secondaryColor}; --accent: ${b.accentColor}; --font-family: ${b.fontFamily}; }
${b.customCSS || ''}`;
  }

  generateEmailTemplate(
    orgId: string,
    template: 'welcome' | 'invite' | 'notification' | 'invoice'
  ): { subject: string; html: string } {
    const b = this.getBranding(orgId);
    const brandHtml = `<table cellpadding="0" cellspacing="0" style="width:100%"><tr><td style="padding:20px;text-align:center;background:${b.primaryColor}">${b.logo ? `<img src="${b.logo}" height="40" alt=""/>` : `<span style="color:white;font-size:24px;font-weight:bold">Brand</span>`}</td></tr></table>`;
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: 'Welcome to the platform',
        html: `${brandHtml}<table><tr><td style="padding:20px"><h1>Welcome!</h1><p>Thanks for joining.</p></td></tr></table>`,
      },
      invite: {
        subject: "You've been invited",
        html: `${brandHtml}<table><tr><td style="padding:20px"><h1>You're invited!</h1><p>Click the link below to join.</p></td></tr></table>`,
      },
      notification: {
        subject: 'New notification',
        html: `${brandHtml}<table><tr><td style="padding:20px"><h1>Notification</h1><p>You have a new notification.</p></td></tr></table>`,
      },
      invoice: {
        subject: 'Your invoice is ready',
        html: `${brandHtml}<table><tr><td style="padding:20px"><h1>Invoice</h1><p>Your invoice is attached.</p></td></tr></table>`,
      },
    };
    return templates[template] || { subject: 'Notification', html: brandHtml };
  }

  // ─── Custom Domain ──────────────────────────────────────────────

  getCustomDomainConfig(domain: string): CustomDomain {
    return {
      domain,
      verified: false,
      verificationMethod: 'TXT',
      verificationValue: `sukit-verify=${crypto.randomUUID().substring(0, 16)}`,
      sslStatus: 'pending',
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 },
        { type: 'CNAME', name: 'www', value: 'app.sukit.dev', ttl: 3600 },
        { type: 'TXT', name: '@', value: `sukit-verify=...`, ttl: 3600 },
      ],
      addedAt: new Date().toISOString(),
    };
  }

  verifyDomain(domain: string): {
    verified: boolean;
    dnsCheck: boolean;
    sslStatus: string;
  } {
    return { verified: true, dnsCheck: true, sslStatus: 'active' };
  }

  // ─── Reseller Management ───────────────────────────────────────

  createResellerOrg(
    parentOrgId: string,
    name: string,
    tier: string
  ): ResellerOrg {
    const org: ResellerOrg = {
      id: `res_${crypto.randomUUID().substring(0, 12)}`,
      parentOrgId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tier,
      branding: { ...this.defaultBranding },
      customDomain: null,
      commissionRate: 0.2,
      totalRevenue: 0,
      customerCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.resellerOrgs.set(org.id, org);
    return org;
  }

  getResellerOrgs(parentOrgId: string): ResellerOrg[] {
    return Array.from(this.resellerOrgs.values()).filter(
      (r) => r.parentOrgId === parentOrgId
    );
  }

  getResellerStats(resellerId: string): {
    totalCustomers: number;
    totalRevenue: number;
    commissionEarned: number;
    activeSubscriptions: number;
    monthlyGrowth: number;
  } {
    return {
      totalCustomers: 0,
      totalRevenue: 0,
      commissionEarned: 0,
      activeSubscriptions: 0,
      monthlyGrowth: 0,
    };
  }

  generateResellerPortalConfig(resellerId: string): {
    portalUrl: string;
    apiKey: string;
    branding: BrandingConfig;
  } {
    return {
      portalUrl: `https://${resellerId}.sukit.dev`,
      apiKey: `res_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
      branding: this.defaultBranding,
    };
  }
}
