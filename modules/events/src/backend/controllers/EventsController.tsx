interface StoredEvent {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venue?: string;
  capacity: number;
  status: string;
  category?: string;
  image?: string;
}
interface StoredTicket {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}
interface StoredAttendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  ticketId: string;
  checkedIn: boolean;
}
interface StoredSession {
  id: string;
  eventId: string;
  title: string;
  speaker?: string;
  startTime: Date;
  endTime: Date;
}

const store: {
  events: StoredEvent[];
  tickets: StoredTicket[];
  attendees: StoredAttendee[];
  sessions: StoredSession[];
} = { events: [], tickets: [], attendees: [], sessions: [] };
let nextId = 1;

export class EventsController {
  async listEvents(query?: { status?: string; category?: string }) {
    let r = store.events;
    if (query?.status) r = r.filter((e) => e.status === query.status);
    if (query?.category) r = r.filter((e) => e.category === query.category);
    return r;
  }
  async getEvent(id: string) {
    const e = store.events.find((e) => e.id === id);
    if (!e) throw new Error('Event not found');
    return e;
  }
  async createEvent(data: any) {
    const ev: StoredEvent = {
      id: String(nextId++),
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      venue: data.venue,
      capacity: data.capacity || 100,
      status: data.status || 'DRAFT',
      category: data.category,
      image: data.image,
    };
    store.events.push(ev);
    return ev;
  }
  async updateEvent(id: string, data: any) {
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    store.events[idx] = { ...store.events[idx], ...data };
    return store.events[idx];
  }
  async deleteEvent(id: string) {
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    store.events.splice(idx, 1);
    return { success: true };
  }

  async listTickets(eventId: string) {
    return store.tickets.filter((t) => t.eventId === eventId);
  }
  async createTicket(data: any) {
    const t: StoredTicket = {
      id: String(nextId++),
      eventId: data.eventId,
      name: data.name,
      price: data.price || 0,
      quantity: data.quantity || 100,
      sold: 0,
    };
    store.tickets.push(t);
    return t;
  }

  async registerAttendee(data: any) {
    const ticket = store.tickets.find((t) => t.id === data.ticketId);
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.sold >= ticket.quantity) throw new Error('Ticket sold out');
    const a: StoredAttendee = {
      id: String(nextId++),
      eventId: data.eventId,
      name: data.name,
      email: data.email,
      ticketId: data.ticketId,
      checkedIn: false,
    };
    store.attendees.push(a);
    ticket.sold++;
    return a;
  }
  async checkIn(attendeeId: string) {
    const idx = store.attendees.findIndex((a) => a.id === attendeeId);
    if (idx === -1) throw new Error('Attendee not found');
    store.attendees[idx].checkedIn = true;
    return store.attendees[idx];
  }
  async listAttendees(eventId: string) {
    return store.attendees.filter((a) => a.eventId === eventId);
  }

  async listSessions(eventId: string) {
    return store.sessions.filter((s) => s.eventId === eventId);
  }
  async createSession(data: any) {
    const s: StoredSession = {
      id: String(nextId++),
      eventId: data.eventId,
      title: data.title,
      speaker: data.speaker,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };
    store.sessions.push(s);
    return s;
  }

  async getAnalytics() {
    const total = store.events.length;
    const totalAttendees = store.attendees.length;
    const checkedIn = store.attendees.filter((a) => a.checkedIn).length;
    const totalRevenue = store.tickets.reduce(
      (sum, t) => sum + t.price * t.sold,
      0
    );
    return { totalEvents: total, totalAttendees, checkedIn, totalRevenue };
  }
}
