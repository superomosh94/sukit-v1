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

  // ─── Custom Domain SSL Provisioning ────────────────────────

  provisionSSL(domain: string): { status: string; certificateArn: string; validationMethod: string; dnsRecords: { type: string; name: string; value: string }[] } {
    const certId = crypto.randomUUID().substring(0, 12);
    return {
      status: 'pending_validation',
      certificateArn: `arn:aws:acm:us-east-1:123456789012:certificate/${certId}`,
      validationMethod: 'DNS',
      dnsRecords: [
        { type: 'CNAME', name: `_${certId}.${domain}`, value: `_${certId}.acm-validations.aws.` },
        { type: 'CNAME', name: `_${certId}.${domain}`, value: `_${certId}.acm-validations.aws.` },
      ],
    };
  }

  checkSSLStatus(domain: string): { status: string; issuedAt: string | null; expiresAt: string | null } {
    return { status: 'active', issuedAt: new Date(Date.now() - 3000000000).toISOString(), expiresAt: new Date(Date.now() + 30000000000).toISOString() };
  }

  // ─── Reseller Provisioning Automation ──────────────────────

  provisionReseller(parentOrgId: string, name: string, tier: string, customBranding?: Partial<BrandingConfig>): ResellerOrg & { portalUrl: string; apiKey: string } {
    const org = this.createResellerOrg(parentOrgId, name, tier);
    if (customBranding) this.applyBranding(org.id, customBranding);
    const portal = this.generateResellerPortalConfig(org.id);
    return { ...org, portalUrl: portal.portalUrl, apiKey: portal.apiKey };
  }

  autoProvisionResellerProducts(resellerId: string): { products: { name: string; price: number; features: string[] }[]; totalValue: number } {
    const products = [
      { name: 'SUKIT Basic Site', price: 19, features: ['1 site', '5 pages', '500MB storage'] },
      { name: 'SUKIT Business Pro', price: 49, features: ['10 sites', '50 pages', '5GB storage', 'Custom domain'] },
      { name: 'SUKIT Enterprise', price: 149, features: ['Unlimited sites', 'Unlimited pages', '50GB storage', 'SSO', 'Priority support'] },
    ];
    return { products, totalValue: products.reduce((s, p) => s + p.price, 0) };
  }

  // ─── Custom Terms of Service ───────────────────────────────

  generateCustomTerms(orgId: string, companyName: string, customClauses: { title: string; content: string }[]): string {
    const baseClauses = [
      { title: 'Service Description', content: `${companyName} provides access to the SUKIT platform under the terms below.` },
      { title: 'User Obligations', content: 'Users must maintain the confidentiality of their credentials.' },
      { title: 'Data Protection', content: `${companyName} will process personal data in accordance with applicable privacy laws.` },
      { title: 'Limitation of Liability', content: 'The platform is provided "as is" without warranty of any kind.' },
      { title: 'Termination', content: 'Either party may terminate this agreement with 30 days written notice.' },
    ];
    const allClauses = [...baseClauses, ...customClauses];
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; }
h1 { color: #4F46E5; }
h2 { color: #374151; margin-top: 24px; }
</style></head><body>
<h1>Terms of Service</h1>
<p><strong>${companyName}</strong> — Last updated: ${new Date().toLocaleDateString()}</p>
${allClauses.map(c => `<h2>${c.title}</h2><p>${c.content}</p>`).join('\n')}
</body></html>`;
  }

  // ─── Sub-Tenant Management UI ──────────────────────────────

  generateSubTenantManagementHtml(): string {
    return `import { useState, useEffect } from 'react';

export function SubTenantManager({ parentOrgId }: { parentOrgId: string }) {
  const [tenants, setTenants] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch('/api/whitelabel/resellers?orgId=' + parentOrgId).then(r => r.json()).then(setTenants);
  }, [parentOrgId]);

  const createTenant = async (data: any) => {
    const res = await fetch('/api/whitelabel/resellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentOrgId, ...data }),
    });
    const tenant = await res.json();
    setTenants([...tenants, tenant]);
    setShowCreate(false);
  };

  return (
    <div className="sub-tenant-manager">
      <header><h2>Sub-Tenant Management</h2><button onClick={() => setShowCreate(true)}>+ Add Sub-Tenant</button></header>
      {showCreate && (
        <div className="create-form">
          <input placeholder="Company Name" id="company-name" />
          <select id="tier"><option value="starter">Starter</option><option value="growth">Growth</option><option value="enterprise">Enterprise</option></select>
          <button onClick={() => createTenant({ name: document.getElementById('company-name').value, tier: document.getElementById('tier').value })}>Create</button>
          <button onClick={() => setShowCreate(false)}>Cancel</button>
        </div>
      )}
      <table><thead><tr><th>Name</th><th>Slug</th><th>Plan</th><th>Status</th><th>Revenue</th><th>Customers</th><th>Created</th></tr></thead>
      <tbody>{tenants.map(t => (
        <tr key={t.id}>
          <td>{t.name}</td><td>{t.slug}</td><td>{t.tier}</td>
          <td><span className={'status ' + t.status}>{t.status}</span></td>
          <td>$${t.totalRevenue}</td><td>{t.customerCount}</td>
          <td>{new Date(t.createdAt).toLocaleDateString()}</td>
        </tr>
      ))}</tbody></table>
      <style>{`
        .sub-tenant-manager { padding: 24px; font-family: -apple-system, sans-serif; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .create-form { display: flex; gap: 8px; margin-bottom: 16px; }
        .create-form input, .create-form select, .create-form button { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
        .create-form button { background: #4F46E5; color: #fff; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
        .status.active { color: #059669; }
        .status.suspended { color: #DC2626; }
      `}</style>
    </div>
  );
}`;
  }

  // ─── Custom Support Email Routing ──────────────────────────

  setSupportEmailRouting(orgId: string, config: { domain: string; forwardTo: string; catchAll: boolean; subdomainRouting: Record<string, string> }): void {
    this.kernel.settings.set(`support-email:${orgId}`, JSON.stringify(config));
  }

  getSupportEmailRouting(orgId: string): { domain: string; forwardTo: string; catchAll: boolean; subdomainRouting: Record<string, string> } | null {
    const data = this.kernel.settings.get(`support-email:${orgId}`);
    return data ? JSON.parse(data as string) : null;
  }

  generateSupportEmailConfig(orgId: string): Record<string, any> {
    return {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY || '',
      inboundDomain: `support.${orgId}.sukit.dev`,
      forwardTo: `support+${orgId}@sukit.dev`,
      mxRecords: [
        { priority: 10, host: 'mx.sendgrid.net' },
      ],
      spfRecord: 'v=spf1 include:sendgrid.net ~all',
      dkimRecords: [
        { selector: 's1', domain: 'sendgrid.net' },
      ],
    };
  }
}
