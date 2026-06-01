import { useEffect, useState } from 'react';
import { HelpCircle, ThumbsUp, Layers, MessageSquare } from 'lucide-react';
import { faqApi } from '../services/api';
import { cn } from '../utils/cn';
export function FaqDashboard() {
  const [a, setA] = useState<any>(null);
  useEffect(() => {
    faqApi.getAnalytics().then(setA);
  }, []);
  const s = [
    {
      label: 'Total FAQs',
      value: a?.total || 0,
      icon: HelpCircle,
      color: 'text-blue-500',
    },
    {
      label: 'Published',
      value: a?.published || 0,
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      label: 'Categories',
      value: a?.categories || 0,
      icon: Layers,
      color: 'text-purple-500',
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FAQ</h1>
        <p className="text-gray-500 text-sm">
          Manage frequently asked questions
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {s.map((x) => (
          <div
            key={x.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
          >
            <div className="flex items-center gap-2 mb-1">
              <x.icon className={cn('w-4 h-4', x.color)} />
              <span className="text-sm text-gray-500">{x.label}</span>
            </div>
            <p className="text-2xl font-bold">{x.value}</p>
          </div>
        ))}
      </div>
      {a?.mostHelpful && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Most Helpful FAQs</h3>
          {a.mostHelpful.map((f: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between py-1 text-sm"
            >
              <span>{f.question}</span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {f.helpful}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
