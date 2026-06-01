import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, DollarSign, Save, X } from 'lucide-react';
import { membershipApi, PlanData } from '../services/api';
import { cn } from '../utils/cn';

export function MembershipPlans() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanData>({
    name: '',
    description: '',
    price: 0,
    interval: 'month',
    features: [],
    status: 'ACTIVE',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await membershipApi.listPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await membershipApi.updatePlan(editingId, form);
    } else {
      await membershipApi.createPlan(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: 0,
      interval: 'month',
      features: [],
      status: 'ACTIVE',
    });
    loadPlans();
  };

  const handleEdit = (plan: PlanData) => {
    setForm(plan);
    setEditingId(plan.id!);
    setShowForm(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membership Plans</h1>
          <p className="text-gray-500 text-sm">
            Create and manage subscription tiers
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({
              name: '',
              description: '',
              price: 0,
              interval: 'month',
              features: [],
              status: 'ACTIVE',
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              {editingId ? 'Edit Plan' : 'New Plan'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Plan name"
            className="w-full p-2 border rounded text-sm"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                placeholder="Price"
                className="w-full pl-8 p-2 border rounded text-sm"
              />
            </div>
            <select
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              className="p-2 border rounded text-sm"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
              <option value="week">Weekly</option>
              <option value="day">Daily</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                placeholder="Add feature..."
                className="flex-1 p-2 border rounded text-sm"
              />
              <button
                onClick={addFeature}
                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.features.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {f}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        features: form.features.filter((_, j) => j !== i),
                      })
                    }
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
          >
            <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Plan
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await membershipApi.deletePlan(plan.id!);
                    loadPlans();
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {plan.description && (
              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
            )}
            <div className="flex items-baseline gap-1 my-3">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-500">/{plan.interval}</span>
            </div>
            <ul className="space-y-1 mb-4">
              {plan.features?.map((f, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 flex items-center gap-1"
                >
                  <span className="text-green-500">\u2713</span>
                  {f}
                </li>
              ))}
            </ul>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium border',
                plan.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              )}
            >
              {plan.status}
            </span>
          </div>
        ))}
        {!loading && plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No plans yet. Create your first membership plan!
          </div>
        )}
      </div>
    </div>
  );
}
