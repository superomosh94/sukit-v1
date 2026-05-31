'use client'

import { useState } from 'react'
import {
  Type,
  Hash,
  Mail,
  Globe,
  Phone,
  AlignLeft,
  ChevronDown,
  CircleDot,
  Square,
  Calendar,
  Clock,
  Paperclip,
  Palette,
  Braces,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface FieldType {
  type: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const FIELD_TYPES: FieldType[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'url', label: 'URL', icon: Globe },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Textarea', icon: AlignLeft },
  { type: 'select', label: 'Select', icon: ChevronDown },
  { type: 'radio', label: 'Radio', icon: CircleDot },
  { type: 'checkbox', label: 'Checkbox', icon: Square },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'file', label: 'File', icon: Paperclip },
  { type: 'color', label: 'Color', icon: Palette },
  { type: 'json', label: 'JSON', icon: Braces },
]

interface FieldPaletteProps {
  onAddField: (type: string) => void
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  const [search, setSearch] = useState('')

  const filtered = FIELD_TYPES.filter((f) =>
    f.label.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search fields..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((field) => {
          const Icon = field.icon
          return (
            <button
              key={field.type}
              type="button"
              onClick={() => onAddField(field.type)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-md border border-input bg-background p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="size-5" />
              <span>{field.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
