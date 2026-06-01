const API_BASE = '/api/events';

export interface EventData {
  id?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  capacity: number;
  status: string;
  category?: string;
  image?: string;
}
export interface TicketData {
  id?: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold?: number;
}
export interface AttendeeData {
  id?: string;
  eventId: string;
  name: string;
  email: string;
  ticketId: string;
  checkedIn?: boolean;
}
export interface SessionData {
  id?: string;
  eventId: string;
  title: string;
  speaker?: string;
  startTime: string;
  endTime: string;
}

export const eventsApi = {
  async list(params?: {
    status?: string;
    category?: string;
  }): Promise<EventData[]> {
    const qs = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    const r = await fetch(`${API_BASE}${qs}`);
    return r.json();
  },
  async get(id: string): Promise<EventData> {
    const r = await fetch(`${API_BASE}/${id}`);
    return r.json();
  },
  async create(d: EventData): Promise<EventData> {
    const r = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async update(id: string, d: Partial<EventData>): Promise<EventData> {
    const r = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  },
  async listTickets(eventId: string): Promise<TicketData[]> {
    const r = await fetch(`${API_BASE}/${eventId}/tickets`);
    return r.json();
  },
  async createTicket(d: TicketData): Promise<TicketData> {
    const r = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async register(d: AttendeeData): Promise<AttendeeData> {
    const r = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async checkIn(attendeeId: string): Promise<void> {
    await fetch(`${API_BASE}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendeeId }),
    });
  },
  async listAttendees(eventId: string): Promise<AttendeeData[]> {
    const r = await fetch(`${API_BASE}/${eventId}/attendees`);
    return r.json();
  },
  async listSessions(eventId: string): Promise<SessionData[]> {
    const r = await fetch(`${API_BASE}/${eventId}/sessions`);
    return r.json();
  },
  async createSession(d: SessionData): Promise<SessionData> {
    const r = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    return r.json();
  },
  async getAnalytics(): Promise<any> {
    const r = await fetch(`${API_BASE}/analytics`);
    return r.json();
  },
};
