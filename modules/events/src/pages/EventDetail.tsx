import { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckSquare,
  QrCode,
} from 'lucide-react';
import { eventsApi, EventData, TicketData, SessionData } from '../services/api';

export function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    eventsApi.get(id).then(setEvent);
    eventsApi.listTickets(id).then(setTickets);
    eventsApi.listSessions(id).then(setSessions);
    eventsApi.listAttendees(id).then(setAttendees);
  }, [id]);

  if (!event) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-gray-500 text-sm">{event.description}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {event.startDate?.slice(0, 10)} - {event.endDate?.slice(0, 10)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            {event.venue || 'TBD'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            {event.capacity} capacity
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Ticket Tiers</h3>
        <div className="grid grid-cols-3 gap-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border text-sm"
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-lg font-bold">${t.price}</div>
              <div className="text-gray-500">
                {t.sold}/{t.quantity} sold
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Agenda</h3>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 border text-sm flex justify-between"
            >
              <span className="font-medium">{s.title}</span>
              <span className="text-gray-500">
                {s.speaker} - {s.startTime?.slice(11, 16)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Attendees ({attendees.length})</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          {attendees.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 border-b text-sm last:border-0"
            >
              <span>
                {a.name} ({a.email})
              </span>
              <span
                className={
                  a.checkedIn
                    ? 'text-green-600 flex items-center gap-1'
                    : 'text-gray-400'
                }
              >
                <CheckSquare className="w-3 h-3" />
                {a.checkedIn ? 'Checked In' : 'Not checked in'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
