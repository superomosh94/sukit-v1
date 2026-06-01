import { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, Users, Edit3, Trash2 } from 'lucide-react';
import { eventsApi, EventData } from '../services/api';
import { cn } from '../utils/cn';

export function EventsList() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const d = await eventsApi.list();
    setEvents(d);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-gray-500 text-sm">Create and manage events</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {ev.image && (
              <div
                className="h-32 bg-gray-200"
                style={{
                  backgroundImage: `url(${ev.image})`,
                  backgroundSize: 'cover',
                }}
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{ev.name}</h3>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    ev.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  )}
                >
                  {ev.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {ev.description?.slice(0, 100)}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ev.startDate?.slice(0, 10)}
                </span>
                {ev.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ev.venue}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ev.capacity}
                </span>
              </div>
            </div>
          </div>
        ))}
        {!loading && events.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}
