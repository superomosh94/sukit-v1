import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StoredService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  active: boolean;
}
interface StoredBooking {
  id: string;
  serviceId: string;
  customerId: string;
  staffId?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes?: string;
}
interface StoredStaff {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  active: boolean;
}
interface StoredCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

const store: {
  services: StoredService[];
  bookings: StoredBooking[];
  staff: StoredStaff[];
  customers: StoredCustomer[];
} = {
  services: [],
  bookings: [],
  staff: [],
  customers: [],
};
let nextId = 1;

export class BookingController {
  async listServices() {
    return store.services;
  }
  async getService(id: string) {
    const s = store.services.find((s) => s.id === id);
    if (!s) throw new Error('Service not found');
    return s;
  }
  async createService(data: any) {
    const svc: StoredService = {
      id: String(nextId++),
      name: data.name,
      description: data.description,
      duration: data.duration || 60,
      price: data.price || 0,
      category: data.category,
      active: true,
    };
    store.services.push(svc);
    return svc;
  }
  async updateService(id: string, data: any) {
    const idx = store.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    store.services[idx] = { ...store.services[idx], ...data };
    return store.services[idx];
  }
  async deleteService(id: string) {
    const idx = store.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    store.services.splice(idx, 1);
    return { success: true };
  }

  async listBookings(query?: {
    status?: string;
    date?: string;
    staffId?: string;
  }) {
    let result = store.bookings;
    if (query?.status) result = result.filter((b) => b.status === query.status);
    if (query?.date)
      result = result.filter((b) =>
        b.startTime.toISOString().startsWith(query.date!)
      );
    if (query?.staffId)
      result = result.filter((b) => b.staffId === query.staffId);
    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  async getBooking(id: string) {
    const b = store.bookings.find((b) => b.id === id);
    if (!b) throw new Error('Booking not found');
    return b;
  }
  async createBooking(data: any) {
    const booking: StoredBooking = {
      id: String(nextId++),
      serviceId: data.serviceId,
      customerId: data.customerId,
      staffId: data.staffId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: 'CONFIRMED',
      notes: data.notes,
    };
    store.bookings.push(booking);
    return booking;
  }
  async updateBooking(id: string, data: any) {
    const idx = store.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    store.bookings[idx] = { ...store.bookings[idx], ...data };
    return store.bookings[idx];
  }
  async cancelBooking(id: string) {
    const idx = store.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    store.bookings[idx].status = 'CANCELLED';
    return store.bookings[idx];
  }

  async listStaff() {
    return store.staff;
  }
  async createStaff(data: any) {
    const s: StoredStaff = {
      id: String(nextId++),
      name: data.name,
      email: data.email,
      specialties: data.specialties || [],
      active: true,
    };
    store.staff.push(s);
    return s;
  }
  async updateStaff(id: string, data: any) {
    const idx = store.staff.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Staff not found');
    store.staff[idx] = { ...store.staff[idx], ...data };
    return store.staff[idx];
  }

  async listCustomers() {
    return store.customers;
  }
  async createCustomer(data: any) {
    const c: StoredCustomer = {
      id: String(nextId++),
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    };
    store.customers.push(c);
    return c;
  }

  async getTimeSlots(date: string, serviceId?: string) {
    const dayStart = new Date(date + 'T00:00:00Z');
    const dayEnd = new Date(date + 'T23:59:59Z');
    const dayBookings = store.bookings.filter(
      (b) => b.startTime >= dayStart && b.endTime <= dayEnd
    );
    const slots = [];
    for (let h = 8; h < 18; h++) {
      const slotStart = new Date(
        date + `T${String(h).padStart(2, '0')}:00:00Z`
      );
      const isBooked = dayBookings.some(
        (b) => b.startTime.getTime() === slotStart.getTime()
      );
      slots.push({
        time: `${String(h).padStart(2, '0')}:00`,
        available: !isBooked,
      });
    }
    return slots;
  }

  async getAnalytics() {
    const total = store.bookings.length;
    const confirmed = store.bookings.filter(
      (b) => b.status === 'CONFIRMED'
    ).length;
    const cancelled = store.bookings.filter(
      (b) => b.status === 'CANCELLED'
    ).length;
    return { total, confirmed, cancelled };
  }

  async checkAvailability(serviceId: string, date: string, staffId?: string) {
    const service = store.services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Service not found');
    return this.getTimeSlots(date, serviceId);
  }
}
