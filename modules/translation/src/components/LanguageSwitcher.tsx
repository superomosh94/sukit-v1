import { Globe } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  languages: Array<{ code: string; name: string; nativeName: string }>;
  current: string;
  onChange: (code: string) => void;
}

export function LanguageSwitcher({ languages, current, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border-none bg-transparent outline-none cursor-pointer"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
