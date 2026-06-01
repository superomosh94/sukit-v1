import { useEffect, useState } from 'react';
import {
  Plus,
  Code,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Globe,
} from 'lucide-react';
import { customCodeApi } from '../services/api';
import { cn } from '../utils/cn';
export function CustomCodeDashboard() {
  const [snippets, setS] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({
    name: '',
    type: 'js',
    content: '',
    location: 'header',
    active: true,
    pageTarget: '*',
  });
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setS(await customCodeApi.list());
    setL(false);
  };
  const handleSubmit = async () => {
    await customCodeApi.create(f);
    setF({
      name: '',
      type: 'js',
      content: '',
      location: 'header',
      active: true,
      pageTarget: '*',
    });
    setSF(false);
    load();
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Code</h1>
          <p className="text-gray-500 text-sm">
            Inject custom CSS, JS, and tracking scripts
          </p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Code
        </button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Snippet name"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex gap-2">
            <select
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value })}
              className="p-2 border rounded text-sm"
            >
              <option value="js">JavaScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
            </select>
            <select
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value as any })}
              className="p-2 border rounded text-sm"
            >
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
          </div>
          <textarea
            value={f.content}
            onChange={(e) => setF({ ...f, content: e.target.value })}
            placeholder="Code content"
            className="w-full p-2 border rounded text-sm font-mono"
            rows={6}
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        {snippets.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-400" />
              <div>
                <span className="font-medium text-sm">{s.name}</span>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{s.type?.toUpperCase()}</span>
                  <span>{s.location || 'header'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border',
                  s.active
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {s.active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={async () => {
                  await customCodeApi.toggle(s.id!);
                  load();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {s.active ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={async () => {
                  await customCodeApi.delete(s.id!);
                  load();
                }}
                className="p-1 hover:bg-red-50 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!l && snippets.length === 0 && (
          <div className="text-center py-8 text-gray-500">No code snippets</div>
        )}
      </div>
    </div>
  );
}
