import { useEffect, useState } from 'react';
import { Save, Globe } from 'lucide-react';
import { translationApi } from '../services/api';
export function TranslationEditor() {
  const [langs, setL] = useState<any[]>([]);
  const [keys, setK] = useState<any[]>([]);
  const [selectedLang, setSel] = useState('');
  const [values, setV] = useState<Record<string, string>>({});
  useEffect(() => {
    translationApi.listLanguages().then((d) => {
      setL(d);
      if (d.length) setSel(d[0].code);
    });
    translationApi.listKeys().then(setK);
  }, []);
  useEffect(() => {
    if (keys.length && selectedLang) {
      const m: Record<string, string> = {};
      keys.forEach((k) => {
        m[k.id!] = k.translations[selectedLang] || '';
      });
      setV(m);
    }
  }, [keys, selectedLang]);
  const handleSave = async () => {
    for (const [k, v] of Object.entries(values)) {
      await translationApi.updateTranslation(k, selectedLang, v);
    }
    alert('Saved!');
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Translation Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSel(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.code})
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save All
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {keys.map((k) => (
          <div
            key={k.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 border flex items-center gap-3"
          >
            <div className="w-48">
              <div className="text-xs font-mono text-gray-500">{k.key}</div>
              <div className="text-xs text-gray-400">{k.group}</div>
            </div>
            <input
              value={values[k.id!] || ''}
              onChange={(e) => setV({ ...values, [k.id!]: e.target.value })}
              placeholder={`Translate to ${selectedLang}...`}
              className="flex-1 p-2 border rounded text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
