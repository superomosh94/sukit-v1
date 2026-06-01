import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceData, BookingData, StaffData } from '../services/api';

interface BookingStore {
  services: ServiceData[];
  bookings: BookingData[];
  staff: StaffData[];
  selectedDate: string;
  isLoading: boolean;
  setServices: (services: ServiceData[]) => void;
  setBookings: (bookings: BookingData[]) => void;
  setStaff: (staff: StaffData[]) => void;
  setSelectedDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  addBooking: (booking: BookingData) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      services: [],
      bookings: [],
      staff: [],
      selectedDate: new Date().toISOString().slice(0, 10),
      isLoading: false,
      setServices: (services) => set({ services }),
      setBookings: (bookings) => set({ bookings }),
      setStaff: (staff) => set({ staff }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setLoading: (loading) => set({ isLoading: loading }),
      addBooking: (booking) =>
        set((state) => ({ bookings: [...state.bookings, booking] })),
    }),
    {
      name: 'sukit-booking-store',
      partialize: (state) => ({ services: state.services, staff: state.staff }),
    }
  )
);
