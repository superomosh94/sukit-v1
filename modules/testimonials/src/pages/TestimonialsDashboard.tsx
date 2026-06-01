import { useEffect, useState } from 'react';
import { Plus, Star, Trash2, MessageSquareQuote, Award } from 'lucide-react';
import { testimonialApi } from '../services/api';
import { cn } from '../utils/cn';
export function TestimonialsDashboard() {
  const [items, setI] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    name: '',
    title: '',
    company: '',
    content: '',
    rating: 5,
    featured: false,
  });
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setI(await testimonialApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await testimonialApi.create(f);
    setF({
      name: '',
      title: '',
      company: '',
      content: '',
      rating: 5,
      featured: false,
    });
    setSF(false);
    load();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-gray-500 text-sm">Manage customer testimonials</p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Customer name"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="Title"
              className="p-2 border rounded text-sm"
            />
            <input
              value={f.company}
              onChange={(e) => setF({ ...f, company: e.target.value })}
              placeholder="Company"
              className="p-2 border rounded text-sm"
            />
          </div>
          <textarea
            value={f.content}
            onChange={(e) => setF({ ...f, content: e.target.value })}
            placeholder="Testimonial content"
            className="w-full p-2 border rounded text-sm"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">Rating:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setF({ ...f, rating: i })}
                className={cn(
                  'text-lg',
                  i <= f.rating ? 'text-yellow-400' : 'text-gray-300'
                )}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">{t.name[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <button
                    onClick={async () => {
                      await testimonialApi.toggleFeatured(t.id!);
                      load();
                    }}
                    className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      t.featured
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {t.featured ? 'Featured' : 'Set Featured'}
                  </button>
                </div>
                {t.title && (
                  <span className="text-sm text-gray-500">
                    {t.title}
                    {t.company ? ` at ${t.company}` : ''}
                  </span>
                )}
                <div className="flex my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'text-sm',
                        i < t.rating ? 'text-yellow-400' : 'text-gray-300'
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">"{t.content}"</p>
                <button
                  onClick={async () => {
                    await testimonialApi.delete(t.id!);
                    load();
                  }}
                  className="mt-2 p-1 hover:bg-red-50 rounded text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
