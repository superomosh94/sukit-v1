'use client';

import { useDraggable } from '@dnd-kit/core';
import {
  useFormBuilderStore,
  type FormField,
} from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

const FIELD_TYPES: Array<{
  type: FormField['type'];
  label: string;
  icon: string;
  description: string;
}> = [
  {
    type: 'text',
    label: 'Text',
    icon: 'Aa',
    description: 'Single line text input',
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: '¶',
    description: 'Multi-line text input',
  },
  {
    type: 'email',
    label: 'Email',
    icon: '@',
    description: 'Email address input',
  },
  { type: 'number', label: 'Number', icon: '#', description: 'Numeric input' },
  {
    type: 'select',
    label: 'Select',
    icon: '▼',
    description: 'Dropdown selector',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: '☑',
    description: 'Multiple choice',
  },
  { type: 'radio', label: 'Radio', icon: '◉', description: 'Single choice' },
  {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
    description: 'File upload input',
  },
  { type: 'date', label: 'Date', icon: '📅', description: 'Date picker' },
  { type: 'rating', label: 'Rating', icon: '★', description: 'Star rating' },
];

interface FieldLibraryProps {
  className?: string;
}

export function FieldLibrary({ className }: FieldLibraryProps) {
  const addField = useFormBuilderStore((s) => s.addField);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-medium">Field Library</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {FIELD_TYPES.map(({ type, label, icon, description }) => (
          <button
            key={type}
            onClick={() => addField(type)}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-background p-3 text-center transition-colors hover:bg-accent"
          >
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-sm text-primary">
              {icon}
            </div>
            <span className="text-xs font-medium">{label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
