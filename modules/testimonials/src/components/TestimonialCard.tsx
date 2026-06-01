import { cn } from '../utils/cn';
interface Props {
  testimonial: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
    content: string;
    rating: number;
    featured?: boolean;
  };
}
export function TestimonialCard({ testimonial: t }: Props) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg p-6 border',
        t.featured && 'ring-2 ring-yellow-400'
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gr ay-200 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-gray-600">{t.name[0]}</span>
        </div>
        <div>
          <div className="font-semibold">{t.name}</div>
          {t.title && (
            <div className="text-sm text-gray-500">
              {t.title}
              {t.company ? ` · ${t.company}` : ''}
            </div>
          )}
        </div>
      </div>
      <div className="flex mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'text-lg',
              i < t.rating ? 'text-yellow-400' : 'text-gray-300'
            )}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-600 italic">"{t.content}"</p>
    </div>
  );
}
