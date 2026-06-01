import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Search,
} from 'lucide-react';
import { cn } from '../utils/cn';
interface Props {
  items: Array<{
    id: string;
    question: string;
    answer: string;
    helpful: number;
    notHelpful: number;
  }>;
  onVote: (id: string, type: 'helpful' | 'notHelpful') => void;
}
export function FaqAccordion({ items, onVote }: Props) {
  const [expanded, setExp] = useState<string | null>(null);
  const [s, setS] = useState('');
  const filtered = items.filter(
    (f) =>
      f.question.toLowerCase().includes(s.toLowerCase()) ||
      f.answer.toLowerCase().includes(s.toLowerCase())
  );
  return (
    <div className="space-y-1">
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={s}
          onChange={(e) => setS(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-8 p-2 border rounded text-sm"
        />
      </div>
      {filtered.map((f) => (
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
              <p className="text-sm text-gray-600 mb-2">{f.answer}</p>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => onVote(f.id!, 'helpful')}
                  className="flex items-center gap-1 hover:text-green-600"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {f.helpful}
                </button>
                <button
                  onClick={() => onVote(f.id!, 'notHelpful')}
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
  );
}
