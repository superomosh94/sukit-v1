import { User, Star } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  staff: {
    id?: string;
    name: string;
    email: string;
    specialties?: string[];
    active?: boolean;
  };
  selected?: boolean;
  onSelect?: () => void;
}

export function StaffCard({ staff, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-3 text-left border rounded-lg transition-colors',
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'hover:border-gray-300'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <div className="font-medium text-sm">{staff.name}</div>
          <div className="text-xs text-gray-500">{staff.email}</div>
        </div>
      </div>
      {staff.specialties && staff.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {staff.specialties.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
