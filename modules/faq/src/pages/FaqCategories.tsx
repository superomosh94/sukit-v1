import { useEffect, useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { faqApi } from '../services/api';
import { cn } from '../utils/cn';
export function FaqCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [faqs, setF] = useState<any[]>([]);
  const [sel, setSel] = useState<string>('');
  const [expanded, setExp] = useState<string | null>(null);
  const [showForm, setSF] = useState(false);
  const [f, setFf] = useState({ name: '' });
  useEffect(() => {
    faqApi.listCategories().then(setCats);
    faqApi.listFaqs().then(setF);
  }, []);
  const selectCat = async (id: string) => {
    setSel(id);
    setF(await faqApi.listFaqs(id));
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQ Categories</h1>
        </div>
        <button
          onClick={() => setSF(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Plus className="w-3 h-3" />
          Category
        </button>
      </div>
      {showForm && (
        <div className="flex gap-2">
          <input
            value={f.name}
            onChange={(e) => setFf({ name: e.target.value })}
            placeholder="Category name"
            className="flex-1 p-2 border rounded text-sm"
          />
          <button
            onClick={async () => {
              await faqApi.createCategory(f);
              setSF(false);
              setF(await faqApi.listCategories());
              setFf({ name: '' });
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCat(c.id!)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border',
              sel === c.id
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'hover:border-gray-300'
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {faqs.map((f) => (
          <div
            key={f.id}
            className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden"
          >
            <button
              onClick={() => setExp(expanded === f.id ? null : f.id)}
              className="w-full p-3 flex items-center justify-between text-left text-sm font-medium hover:bg-gray-50"
            >
              {f.question}
              {expanded === f.id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expanded === f.id && (
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {f.answer}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <button
                    onClick={async () => {
                      await faqApi.vote(f.id!, 'helpful');
                    }}
                    className="flex items-center gap-1 hover:text-green-600"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {f.helpful}
                  </button>
                  <button
                    onClick={async () => {
                      await faqApi.vote(f.id!, 'notHelpful');
                    }}
                    className="flex items-center gap-1 hover:text-red-600"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    {f.notHelpful}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
