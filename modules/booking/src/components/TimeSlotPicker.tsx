import { cn } from '../utils/cn';

interface Props {
  slots: Array<{ time: string; available: boolean }>;
  selectedTime?: string;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({ slots, selectedTime, onSelect }: Props) {
  if (!slots.length)
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No time slots available for this date
      </div>
    );

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={cn(
            'p-2 text-sm border rounded transition-colors',
            slot.available
              ? selectedTime === slot.time
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'hover:border-blue-500 hover:bg-blue-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
