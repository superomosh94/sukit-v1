import { cn } from '../utils/cn';
interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}
export function StarRating({ value, onChange, size = 'md', readonly }: Props) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          disabled={readonly}
          type="button"
          onClick={() => onChange?.(i)}
          className={cn(
            sizes[size],
            i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            !readonly && 'cursor-pointer hover:text-yellow-300'
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}
