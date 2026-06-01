import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

const membershipModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Membership] Activating...');

    kernel.events.on('user:registered', async ({ userId }) => {
      kernel.log.debug(`Checking auto-assign plans for user ${userId}`);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Membership] Deactivating...');
  },
};

export default membershipModule;

export { MembershipDashboard } from './pages/MembershipDashboard';
export { MembershipPlans } from './pages/MembershipPlans';
export { MemberDirectory } from './pages/MemberDirectory';
export { MemberProfile } from './components/MemberProfile';
export { SubscriptionsList } from './components/SubscriptionsList';
export { BadgesDisplay } from './components/BadgesDisplay';
export { Leaderboard } from './components/Leaderboard';
export { useMembership } from './hooks/useMembership';
export { useMembershipStore } from './stores/membershipStore';
