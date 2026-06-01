import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

const eventsModule: Module = {
  manifest: manifest as any,
  async activate(kernel: KernelForModule) {
    kernel.log.info('[Events] Activating...');
    kernel.events.on('event:registered', async ({ userId, eventId }) => {
      kernel.log.debug(`User ${userId} registered for event ${eventId}`);
    });
  },
  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Events] Deactivating...');
  },
};
export default eventsModule;
export { EventsDashboard } from './pages/EventsDashboard';
export { EventsList } from './pages/EventsList';
export { EventDetail } from './pages/EventDetail';
export { EventForm } from './components/EventForm';
export { TicketTierSelector } from './components/TicketTierSelector';
export { AgendaView } from './components/AgendaView';
export { CheckInPanel } from './components/CheckInPanel';
export { useEvents } from './hooks/useEvents';
export { useEventsStore } from './stores/eventsStore';
