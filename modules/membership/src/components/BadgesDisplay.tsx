import { Award } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  badges: Array<{
    id?: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
  }>;
}

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};

export function BadgesDisplay({ badges }: Props) {
  if (!badges.length)
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No badges yet
      </div>
    );

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <div
          key={b.id}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm',
            colorMap[b.color] || colorMap.yellow
          )}
          title={b.description}
        >
          <Award className="w-3 h-3" />
          <span>{b.name}</span>
        </div>
      ))}
    </div>
  );
}
