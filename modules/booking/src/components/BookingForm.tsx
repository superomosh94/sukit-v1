import { useState } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import {
  bookingApi,
  ServiceData,
  StaffData,
  BookingData,
} from '../services/api';

interface Props {
  services: ServiceData[];
  staff: StaffData[];
  onCreated: () => void;
}

export function BookingForm({ services, staff, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<BookingData>>({
    serviceId: '',
    staffId: '',
    startTime: '',
    endTime: '',
    customerName: '',
    customerEmail: '',
    notes: '',
  });

  const [slots, setSlots] = useState<
    Array<{ time: string; available: boolean }>
  >([]);

  const selectService = (id: string) => {
    setForm({ ...form, serviceId: id });
    const service = services.find((s) => s.id === id);
    if (service && form.startTime) {
      const end = new Date(
        new Date(form.startTime).getTime() + service.duration * 60000
      );
      setForm({ ...form, serviceId: id, endTime: end.toISOString() });
    }
    setStep(2);
  };

  const loadSlots = async (date: string) => {
    setForm({ ...form, startTime: date });
    if (form.serviceId) {
      const d = await bookingApi.getTimeSlots(date, form.serviceId);
      setSlots(d);
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    await bookingApi.createBooking(form as BookingData);
    onCreated();
    setStep(1);
    setForm({
      serviceId: '',
      staffId: '',
      startTime: '',
      endTime: '',
      customerName: '',
      customerEmail: '',
      notes: '',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-8 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Select a Service</h3>
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => selectService(s.id!)}
              className="w-full p-3 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">
                {s.duration} min - ${s.price}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Select Date & Time</h3>
          <input
            type="date"
            onChange={(e) => loadSlots(e.target.value)}
            className="w-full p-2 border rounded"
            min={new Date().toISOString().slice(0, 10)}
          />
          {slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  key={s.time}
                  disabled={!s.available}
                  onClick={() => {
                    setForm({
                      ...form,
                      startTime: `${form.startTime?.slice(0, 10)}T${s.time}:00Z`,
                    });
                    setStep(3);
                  }}
                  className={`p-2 text-sm border rounded ${s.available ? 'hover:border-blue-500 hover:bg-blue-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Your Information</h3>
          <input
            value={form.customerName || ''}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Your name"
            className="w-full p-2 border rounded text-sm"
          />
          <input
            value={form.customerEmail || ''}
            onChange={(e) =>
              setForm({ ...form, customerEmail: e.target.value })
            }
            placeholder="Your email"
            className="w-full p-2 border rounded text-sm"
          />
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="w-full p-2 border rounded text-sm"
            rows={3}
          />
          <button
            onClick={() => setStep(4)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Review Booking
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Confirm Booking</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Service: {services.find((s) => s.id === form.serviceId)?.name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date: {form.startTime?.slice(0, 10)}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {form.customerName} ({form.customerEmail})
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
