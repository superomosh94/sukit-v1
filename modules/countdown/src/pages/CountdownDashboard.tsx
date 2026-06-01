import { useEffect, useState } from 'react';
import {
  Plus,
  Timer,
  Eye,
  ToggleRight,
  ToggleLeft,
  Trash2,
  MousePointerClick,
} from 'lucide-react';
import { countdownApi } from '../services/api';
import { cn } from '../utils/cn';
export function CountdownDashboard() {
  const [timers, setT] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [a, setA] = useState<any>(null);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    name: '',
    targetDate: '',
    evergreen: false,
    evergreenDuration: 86400,
    layout: 'default',
    completedAction: 'none',
    completedValue: '',
    active: true,
  });
  useEffect(() => {
    load();
    countdownApi.getAnalytics().then(setA);
  }, []);
  const load = async () => {
    setL(true);
    setT(await countdownApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await countdownApi.create(f);
    setSF(false);
    load();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Countdown Timers</h1>
          <p className="text-gray-500 text-sm">
            Create urgency with countdown timers
          </p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Timer
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <span className="text-sm text-gray-500">Total Timers</span>
          <p className="text-2xl font-bold">{a?.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">Views</span>
          </div>
          <p className="text-2xl font-bold">{a?.totalViews || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-500">Conversions</span>
          </div>
          <p className="text-2xl font-bold">{a?.totalConversions || 0}</p>
        </div>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Timer name"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              value={f.targetDate}
              onChange={(e) => setF({ ...f, targetDate: e.target.value })}
              className="p-2 border rounded text-sm"
            />
            <select
              value={f.layout}
              onChange={(e) => setF({ ...f, layout: e.target.value })}
              className="p-2 border rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="circle">Circle</option>
              <option value="inline">Inline</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="space-y-2">
        {timers.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-blue-500" />
              <div>
                <span className="font-medium">{t.name}</span>
                <div className="text-xs text-gray-500">
                  Target: {new Date(t.targetDate).toLocaleString()}
                  {t.evergreen ? ' (Evergreen)' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {t.views} views / {t.conversions} conv
              </span>
              <button
                onClick={async () => {
                  await countdownApi.update(t.id!, { active: !t.active });
                  load();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {t.active ? (
                  <ToggleRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={async () => {
                  await countdownApi.delete(t.id!);
                  load();
                }}
                className="p-1 hover:bg-red-50 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
