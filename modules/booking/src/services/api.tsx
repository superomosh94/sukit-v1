const API_BASE = '/api/booking';

export interface ServiceData {
  id?: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  active?: boolean;
}
export interface BookingData {
  id?: string;
  serviceId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  staffId?: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}
export interface StaffData {
  id?: string;
  name: string;
  email: string;
  specialties?: string[];
  active?: boolean;
}
export interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export const bookingApi = {
  async listServices(): Promise<ServiceData[]> {
    const r = await fetch(`${API_BASE}/services`);
    return r.json();
  },
  async getService(id: string): Promise<ServiceData> {
    const r = await fetch(`${API_BASE}/services/${id}`);
    return r.json();
  },
  async createService(d: ServiceData): Promise<ServiceData> {
    const r = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async updateService(
    id: string,
    d: Partial<ServiceData>
  ): Promise<ServiceData> {
    const r = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async deleteService(id: string): Promise<void> {
    await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
  },

  async listBookings(params?: {
    status?: string;
    date?: string;
    staffId?: string;
  }): Promise<BookingData[]> {
    const qs = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined)
          ) as any
        ).toString()
      : '';
    const r = await fetch(`${API_BASE}/bookings${qs}`);
    return r.json();
  },
  async getBooking(id: string): Promise<BookingData> {
    const r = await fetch(`${API_BASE}/bookings/${id}`);
    return r.json();
  },
  async createBooking(d: BookingData): Promise<BookingData> {
    const r = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async updateBooking(
    id: string,
    d: Partial<BookingData>
  ): Promise<BookingData> {
    const r = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async cancelBooking(id: string): Promise<void> {
    await fetch(`${API_BASE}/bookings/${id}/cancel`, { method: 'POST' });
  },

  async listStaff(): Promise<StaffData[]> {
    const r = await fetch(`${API_BASE}/staff`);
    return r.json();
  },
  async createStaff(d: StaffData): Promise<StaffData> {
    const r = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async updateStaff(id: string, d: Partial<StaffData>): Promise<StaffData> {
    const r = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },

  async listCustomers(): Promise<CustomerData[]> {
    const r = await fetch(`${API_BASE}/customers`);
    return r.json();
  },
  async createCustomer(d: CustomerData): Promise<CustomerData> {
    const r = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },

  async getTimeSlots(
    date: string,
    serviceId?: string
  ): Promise<Array<{ time: string; available: boolean }>> {
    const qs = `date=${date}${serviceId ? `&serviceId=${serviceId}` : ''}`;
    const r = await fetch(`${API_BASE}/slots?${qs}`);
    return r.json();
  },
  async getAnalytics(): Promise<any> {
    const r = await fetch(`${API_BASE}/analytics`);
    return r.json();
  },
  async checkAvailability(serviceId: string, date: string): Promise<any> {
    const r = await fetch(
      `${API_BASE}/availability?serviceId=${serviceId}&date=${date}`
    );
    return r.json();
  },
};
