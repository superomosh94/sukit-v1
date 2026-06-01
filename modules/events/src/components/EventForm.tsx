import { useState } from 'react';
import { Calendar, Clock, MapPin, Save, Users } from 'lucide-react';
import { eventsApi, EventData } from '../services/api';

interface Props {
  initial?: EventData;
  onSave: (data: EventData) => Promise<void>;
}

export function EventForm({ initial, onSave }: Props) {
  const [form, setForm] = useState<Partial<EventData>>({
    name: initial?.name || '',
    description: initial?.description || '',
    startDate: initial?.startDate || '',
    endDate: initial?.endDate || '',
    venue: initial?.venue || '',
    capacity: initial?.capacity || 100,
    status: initial?.status || 'DRAFT',
    category: initial?.category || '',
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border space-y-4 max-w-2xl">
      <h3 className="font-bold text-lg">
        {initial ? 'Edit Event' : 'New Event'}
      </h3>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Event name"
        className="w-full p-2 border rounded text-sm"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        className="w-full p-2 border rounded text-sm"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Start
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            End
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Venue
          </label>
          <input
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            placeholder="Venue"
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Capacity
          </label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <button
        onClick={() => onSave(form as EventData)}
        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        <Save className="w-4 h-4" />
        Save Event
      </button>
    </div>
  );
}
