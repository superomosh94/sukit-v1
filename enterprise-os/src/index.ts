import type { SukitKernel } from '@sukit/core';
import type { MarketplaceLayer } from '@sukit/marketplace';
import type { ToolsLayer } from '@sukit/tools';
import type { ProductionLayer } from '@sukit/production';
import { OrganizationManager } from './orgs';
import { EnterpriseBilling } from './billing';
import { ComplianceCenter } from './compliance';
import { APIGateway } from './gateway';
import { WhiteLabelManager } from './whitelabel';
import { AdvancedSecurity } from './security';
import { ScalingEngine } from './scaling';
import { EnterpriseSupportPortal } from './support';
import { EnterpriseBackupDR } from './backup-dr';

export class EnterpriseOSLayer {
  public orgs: OrganizationManager;
  public billing: EnterpriseBilling;
  public compliance: ComplianceCenter;
  public gateway: APIGateway;
  public whitelabel: WhiteLabelManager;
  public security: AdvancedSecurity;
  public scaling: ScalingEngine;
  public support: EnterpriseSupportPortal;
  public backupDR: EnterpriseBackupDR;

  private kernel: SukitKernel;
  private initialized = false;

  constructor(
    kernel: SukitKernel,
    production: ProductionLayer,
    marketplace?: MarketplaceLayer,
    tools?: ToolsLayer
  ) {
    this.kernel = kernel;
    this.orgs = new OrganizationManager(kernel);
    this.billing = new EnterpriseBilling(kernel);
    this.compliance = new ComplianceCenter(kernel);
    this.gateway = new APIGateway(kernel);
    this.whitelabel = new WhiteLabelManager(kernel);
    this.security = new AdvancedSecurity(kernel, production);
    this.scaling = new ScalingEngine(kernel);
    this.support = new EnterpriseSupportPortal(kernel);
    this.backupDR = new EnterpriseBackupDR(kernel);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.kernel.events.emit('enterprise:initializing', {});
    await this.backupDR.initialize();
    this.initialized = true;
    await this.kernel.events.emit('enterprise:initialized', {
      systems: [
        'backup-dr',
        'orgs',
        'billing',
        'compliance',
        'gateway',
        'whitelabel',
        'security',
        'scaling',
        'support',
      ],
    });
  }

  getEnterpriseStatus(): Record<string, any> {
    return {
      organizations: { total: this.orgs['orgs'].size, active: 0 },
      billing: { totalRevenue: 0, activeSubscriptions: 0 },
      compliance: this.compliance.getComplianceScore(),
      gateway: { apiKeys: 0, requests24h: 0 },
      scaling: this.scaling.getClusterStatus(),
    };
  }
}

export { OrganizationManager } from './orgs';
export { EnterpriseBilling } from './billing';
export { ComplianceCenter } from './compliance';
export { APIGateway } from './gateway';
export { WhiteLabelManager } from './whitelabel';
export { AdvancedSecurity } from './security';
export { ScalingEngine } from './scaling';
export { EnterpriseSupportPortal } from './support';
