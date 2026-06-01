import { useEffect, useState } from 'react';
import {
  Languages,
  Plus,
  Globe,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { translationApi } from '../services/api';
import { cn } from '../utils/cn';
export function TranslationDashboard() {
  const [langs, setL] = useState<any[]>([]);
  const [keys, setK] = useState<any[]>([]);
  const [showForm, setSF] = useState(false);
  const [f, setF] = useState({ key: '', group: 'general', translations: {} });
  useEffect(() => {
    translationApi.listLanguages().then(setL);
    translationApi.listKeys().then(setK);
  }, []);
  const handleSubmit = async () => {
    await translationApi.createKey(f);
    setF({ key: '', group: 'general', translations: {} });
    setSF(false);
    setK(await translationApi.listKeys());
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Translations</h1>
          <p className="text-gray-500 text-sm">
            Manage multi-language translations
          </p>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {langs.map((l) => (
          <div
            key={l.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border text-sm"
          >
            <Globe className="w-3 h-3" />
            <span>{l.nativeName}</span>
            <span className="text-xs text-gray-400">({l.code})</span>
            <button
              onClick={async () => {
                const r = await translationApi.toggleLanguage(l.code!);
                setL(langs.map((x) => (x.code === l.code ? r : x)));
              }}
              className="ml-1"
            >
              {l.enabled ? (
                <ToggleRight className="w-3 h-3 text-green-500" />
              ) : (
                <ToggleLeft className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border space-y-2">
          <input
            value={f.key}
            onChange={(e) => setF({ ...f, key: e.target.value })}
            placeholder="Translation key (e.g. welcome.message)"
            className="w-full p-2 border rounded text-sm"
          />
          <select
            value={f.group}
            onChange={(e) => setF({ ...f, group: e.target.value })}
            className="p-2 border rounded text-sm"
          >
            <option value="general">General</option>
            <option value="auth">Auth</option>
            <option value="nav">Navigation</option>
            <option value="errors">Errors</option>
          </select>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-3 font-medium">Key</th>
              <th className="p-3 font-medium">Group</th>
              {langs
                .filter((l) => l.enabled)
                .map((l) => (
                  <th key={l.code} className="p-3 font-medium">
                    {l.code}
                  </th>
                ))}
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr
                key={k.id}
                className="border-b last:border-0 hover:bg-gray-50 text-sm"
              >
                <td className="p-3 font-mono">{k.key}</td>
                <td className="p-3">{k.group}</td>
                {langs
                  .filter((l) => l.enabled)
                  .map((l) => (
                    <td key={l.code} className="p-3 text-gray-600">
                      {k.translations[l.code] || '-'}
                    </td>
                  ))}
                <td className="p-3">
                  <button
                    onClick={async () => {
                      await translationApi.deleteKey(k.id!);
                      setK(await translationApi.listKeys());
                    }}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
