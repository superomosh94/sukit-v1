import { useCallback } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { bookingApi, ServiceData, BookingData } from '../services/api';

export function useBooking() {
  const {
    services,
    bookings,
    staff,
    selectedDate,
    isLoading,
    setServices,
    setBookings,
    setStaff,
    setLoading,
  } = useBookingStore();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.listServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  }, [setServices, setLoading]);

  const fetchBookings = useCallback(
    async (params?: { status?: string; date?: string; staffId?: string }) => {
      setLoading(true);
      try {
        const data = await bookingApi.listBookings(params);
        setBookings(data);
      } finally {
        setLoading(false);
      }
    },
    [setBookings, setLoading]
  );

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.listStaff();
      setStaff(data);
    } finally {
      setLoading(false);
    }
  }, [setStaff, setLoading]);

  const createBooking = useCallback(async (data: BookingData) => {
    const booking = await bookingApi.createBooking(data);
    useBookingStore.getState().addBooking(booking);
    return booking;
  }, []);

  return {
    services,
    bookings,
    staff,
    selectedDate,
    isLoading,
    fetchServices,
    fetchBookings,
    fetchStaff,
    createBooking,
  };
}
