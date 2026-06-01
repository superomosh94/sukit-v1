import { useEffect, useState } from 'react';
import { Plus, Edit3, DollarSign, Trash2 } from 'lucide-react';
import { pricingApi } from '../services/api';
import { cn } from '../utils/cn';
export function PricingTableDashboard() {
  const [plans, setP] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [annual, setA] = useState(false);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [],
    highlighted: false,
    ctaText: 'Get Started',
    ctaUrl: '#',
    currency: 'USD',
  });
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setP(await pricingApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await pricingApi.create(f);
    setF({
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [],
      highlighted: false,
      ctaText: 'Get Started',
      ctaUrl: '#',
      currency: 'USD',
    });
    setSF(false);
    load();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Tables</h1>
          <p className="text-gray-500 text-sm">
            Create and manage pricing plans
          </p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Plan name"
            className="w-full p-2 border rounded text-sm"
          />
          <input
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
            placeholder="Description"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Monthly Price</label>
              <input
                type="number"
                value={f.monthlyPrice}
                onChange={(e) =>
                  setF({ ...f, monthlyPrice: Number(e.target.value) })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs">Yearly Price</label>
              <input
                type="number"
                value={f.yearlyPrice}
                onChange={(e) =>
                  setF({ ...f, yearlyPrice: Number(e.target.value) })
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setA(false)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition',
              !annual ? 'bg-white shadow' : ''
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setA(true)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition',
              annual ? 'bg-white shadow' : ''
            )}
          >
            Annual
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-xl p-6 border text-center relative',
              p.highlighted && 'ring-2 ring-blue-500 shadow-lg scale-105'
            )}
          >
            {p.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                Popular
              </span>
            )}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.description}</p>
            <div className="my-4">
              <span className="text-4xl font-bold">
                ${annual ? p.yearlyPrice : p.monthlyPrice}
              </span>
              <span className="text-gray-500">
                /{annual ? 'year' : 'month'}
              </span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-left">
              {p.features?.map((ft: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">\u2713</span>
                  {ft}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                'w-full py-2 rounded-lg text-sm font-medium',
                p.highlighted
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              {p.ctaText}
            </button>
            <div className="flex justify-center gap-1 mt-2">
              <button
                onClick={async () => {
                  await pricingApi.update(p.id!, {
                    ...p,
                    highlighted: !p.highlighted,
                  });
                  load();
                }}
                className="text-xs text-blue-500 hover:underline"
              >
                {p.highlighted ? 'Unmark' : 'Mark as Popular'}
              </button>
              <button
                onClick={async () => {
                  await pricingApi.delete(p.id!);
                  load();
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
