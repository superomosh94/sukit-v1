import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Clock, DollarSign } from 'lucide-react';
import { bookingApi, ServiceData } from '../services/api';

export function BookingServices() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceData>({
    name: '',
    duration: 60,
    price: 0,
    description: '',
    category: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const d = await bookingApi.listServices();
    setServices(d);
    setLoading(false);
  };

  const handleSubmit = async () => {
    await bookingApi.createService(form);
    setShowForm(false);
    setForm({
      name: '',
      duration: 60,
      price: 0,
      description: '',
      category: '',
    });
    loadServices();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-gray-500 text-sm">Manage your booking services</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Service name"
            className="w-full p-2 border rounded text-sm"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Duration (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="w-full p-2 border rounded text-sm"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Save Service
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{s.name}</h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await bookingApi.deleteService(s.id!);
                    loadServices();
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {s.description && (
              <p className="text-sm text-gray-500 mb-2">{s.description}</p>
            )}
            <div className="flex gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {s.duration} min
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {s.price}
              </span>
            </div>
            {s.category && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                {s.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
