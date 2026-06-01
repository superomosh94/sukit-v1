import { cn } from '../utils/cn';

interface Props {
  tiers: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function TicketTierSelector({ tiers, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {tiers.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id!)}
          className={cn(
            'p-4 border rounded-lg text-left transition-all',
            selectedId === t.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
              : 'hover:border-gray-300'
          )}
        >
          <div className="font-bold text-lg">{t.name}</div>
          <div className="text-2xl font-bold mt-1">${t.price}</div>
          <div className="text-sm text-gray-500 mt-1">
            {t.sold}/{t.quantity} remaining
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(t.sold / t.quantity) * 100}%` }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
