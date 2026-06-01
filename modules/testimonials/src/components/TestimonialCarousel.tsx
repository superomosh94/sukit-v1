import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '../utils/cn';
interface Props {
  testimonials: Array<{
    name: string;
    content: string;
    rating: number;
    title?: string;
    company?: string;
  }>;
}
export function TestimonialCarousel({ testimonials }: Props) {
  const [i, setI] = useState(0);
  if (!testimonials.length) return null;
  const t = testimonials[i];
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-8 border text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star
            key={j}
            className={cn(
              'w-5 h-5',
              j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
      <blockquote className="text-lg italic mb-4">"{t.content}"</blockquote>
      <div className="font-semibold">{t.name}</div>
      {t.title && (
        <div className="text-sm text-gray-500">
          {t.title}
          {t.company ? ` - ${t.company}` : ''}
        </div>
      )}
      {i > 0 && (
        <button
          onClick={() => setI(i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white border rounded-full shadow hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {i < testimonials.length - 1 && (
        <button
          onClick={() => setI(i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white border rounded-full shadow hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      <div className="flex justify-center gap-1 mt-4">
        {testimonials.map((_, j) => (
          <button
            key={j}
            onClick={() => setI(j)}
            className={cn(
              'w-2 h-2 rounded-full',
              j === i ? 'bg-blue-500' : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
}
