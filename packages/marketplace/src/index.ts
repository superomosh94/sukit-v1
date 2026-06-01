import type { SukitKernel } from '@sukit/core';
import { ModuleRegistry } from './registry';
import { ModuleInstaller } from './installer';
import { DeveloperPortal } from './developer';
import { ModuleSubmission } from './submission';
import { PaymentSystem } from './payments';
import { ReviewModeration } from './reviews-moderation';
import { ModuleAnalytics } from './analytics';
import { DocumentationGenerator } from './docs';
import { SupportSystem } from './support';

export class MarketplaceLayer {
  public registry: ModuleRegistry;
  public installer: ModuleInstaller;
  public developer: DeveloperPortal;
  public submission: ModuleSubmission;
  public payments: PaymentSystem;
  public reviews: ReviewModeration;
  public analytics: ModuleAnalytics;
  public docs: DocumentationGenerator;
  public support: SupportSystem;

  private kernel: SukitKernel;
  private initialized = false;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.registry = new ModuleRegistry(kernel);
    this.installer = new ModuleInstaller(kernel);
    this.developer = new DeveloperPortal(kernel);
    this.submission = new ModuleSubmission(kernel);
    this.payments = new PaymentSystem(kernel);
    this.reviews = new ReviewModeration(kernel);
    this.analytics = new ModuleAnalytics(kernel);
    this.docs = new DocumentationGenerator(kernel);
    this.support = new SupportSystem(kernel);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.kernel.events.emit('marketplace:initializing', {});

    this.kernel.api.get('/api/marketplace/modules', async () => {
      return new Response(
        JSON.stringify({ message: 'Marketplace API ready' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    this.initialized = true;
    await this.kernel.events.emit('marketplace:initialized', {});
  }

  async destroy(): Promise<void> {
    this.initialized = false;
    await this.kernel.events.emit('marketplace:destroyed', {});
  }
}

export { ModuleRegistry } from './registry';
export { ModuleInstaller } from './installer';
export { DeveloperPortal } from './developer';
export { ModuleSubmission } from './submission';
export { PaymentSystem } from './payments';
export { ReviewModeration } from './reviews-moderation';
export { ModuleAnalytics } from './analytics';
export { DocumentationGenerator } from './docs';
export { SupportSystem } from './support';

export {
  MarketplaceProvider,
  useMarketplace,
  useMarketplaceContext,
  useMarketplaceReady,
} from './provider';
export { useMarketplaceStore, resetMarketplaceStore } from './store';
export {
  useMarketplaceSearch,
  useModuleDetail,
  useModuleInstall,
  useModuleUpdates,
  useDeveloperPortal,
  useModuleAnalytics,
  usePayments,
  useSupport,
  useDocumentation,
  useModuleSubmission,
} from './hooks';

export {
  MarketplaceHome,
  ModuleDetail,
  ModuleCard,
  ModuleSearch,
  ModuleFilter,
  InstallButton,
  InstallProgress,
  ReviewList,
  ReviewForm,
  UpdateManager,
  DeveloperDashboard,
  ModuleSubmissionForm,
  VersionUploader,
  SubmissionStatus,
  DeveloperApiKeys,
  CheckoutModal,
  LicenseManager,
  SubscriptionManager,
  PayoutDashboard,
  ReviewModerationPanel,
  AnalyticsDashboard,
  DocumentationEditor,
  SupportTicketList,
  KnowledgeBase,
  RatingStars,
} from './components';

export type * from './types';
