export * from './types';
export * from './stores/siteManagerStore';
export { useSiteManagerStore } from './stores/siteManagerStore';
export { SiteTree } from './components/SiteTree';
export { SiteSelector } from './components/SiteSelector';
export { PageSettings } from './components/PageSettings';
export { SiteDashboard } from './components/SiteDashboard';
export { TeamManager } from './components/TeamManager';
export { CreateSiteDialog } from './components/CreateSiteDialog';
export { PageIconPicker } from './components/PageIconPicker';
export { StatusBadge } from './components/StatusBadge';
export { StatusFilter } from './components/StatusFilter';
export { CollisionPresence } from './components/CollisionPresence';
export { PageLockIndicator } from './components/PageLockIndicator';
export { PermissionOverrides } from './components/PermissionOverrides';
export { TrashView } from './components/TrashView';
export { CodeInjection } from './components/CodeInjection';
export { BackupSettings } from './components/BackupSettings';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useTreeExpandCollapse } from './hooks/useTreeExpandCollapse';

export {
  handleGetSites,
  handleCreateSite,
  handleGetSite,
  handleUpdateSite,
  handleDeleteSite,
  handleRestoreSite,
  handleArchiveSite,
  handleDuplicateSite,
} from './api/sites';

export {
  handleGetPages,
  handleGetPage,
  handleCreatePage,
  handleUpdatePage,
  handleDeletePage,
  handleRestorePage,
  handleDuplicatePage,
  handleReorderPage,
} from './api/pages';

export {
  handleGetTeam,
  handleInviteMember,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleTransferOwnership,
} from './api/team';

export { handleGetActivity, handleCreateActivity } from './api/activity';

export { handleGetStats, handleSearch } from './api/stats';

// Module lifecycle for kernel compatibility
import type { Module, KernelForModule } from '@sukit/core';
import { useSiteManagerStore } from './stores/siteManagerStore';
import manifest from '../manifest.json';

const siteManagerModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[SiteManager] Activating...');

    kernel.events.on('site:beforeCreate', async ({ data }: any) => {
      kernel.log.debug('Site about to be created', data);
    });
    kernel.events.on('site:afterCreate', async ({ data }: any) => {
      kernel.log.debug('Site created', data);
      const store = useSiteManagerStore.getState();
      await store.loadSites();
    });
    kernel.events.on('page:beforeCreate', async ({ data }: any) => {
      kernel.log.debug('Page about to be created', data);
    });
    kernel.events.on('page:afterCreate', async ({ data }: any) => {
      kernel.log.debug('Page created', data);
      const store = useSiteManagerStore.getState();
      if (store.currentSiteId) await store.loadPages(store.currentSiteId);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[SiteManager] Deactivating...');
  },
};

export default siteManagerModule;
