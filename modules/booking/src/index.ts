import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

const bookingModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Booking] Activating...');
    kernel.events.on('booking:created', async ({ bookingId }) => {
      kernel.log.debug(`Sending confirmation for booking ${bookingId}`);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Booking] Deactivating...');
  },
};

export default bookingModule;

export { BookingDashboard } from './pages/BookingDashboard';
export { BookingCalendar } from './pages/BookingCalendar';
export { BookingServices } from './pages/BookingServices';
export { BookingForm } from './components/BookingForm';
export { TimeSlotPicker } from './components/TimeSlotPicker';
export { StaffCard } from './components/StaffCard';
export { useBooking } from './hooks/useBooking';
export { useBookingStore } from './stores/bookingStore';
