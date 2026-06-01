'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import {
  useFormBuilderStore,
  type FormField,
} from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

interface FormBuilderCanvasProps {
  className?: string;
}

export function FormBuilderCanvas({ className }: FormBuilderCanvasProps) {
  const fields = useFormBuilderStore((s) => s.fields);
  const selectedFieldId = useFormBuilderStore((s) => s.selectedFieldId);
  const setSelectedField = useFormBuilderStore((s) => s.setSelectedField);
  const removeField = useFormBuilderStore((s) => s.removeField);
  const reorderFields = useFormBuilderStore((s) => s.reorderFields);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFields(oldIndex, newIndex);
    }
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-medium">Form Canvas</h3>
      </div>
      <div className="min-h-[200px] p-4">
        {fields.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Drop fields here from the Field Library
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    isSelected={field.id === selectedFieldId}
                    onSelect={() => setSelectedField(field.id)}
                    onDelete={() => removeField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-md border bg-background px-3 py-2.5 text-sm cursor-pointer transition-colors',
        isSelected && 'border-primary ring-1 ring-primary',
        'hover:border-primary/50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="size-4" />
      </button>
      <FieldPreview field={field} />
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded p-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return 'Aa';
      case 'textarea':
        return '¶';
      case 'email':
        return '@';
      case 'number':
        return '#';
      case 'select':
        return '▼';
      case 'checkbox':
        return '☑';
      case 'radio':
        return '◉';
      case 'file':
        return '📎';
      case 'date':
        return '📅';
      case 'rating':
        return '★';
      default:
        return '?';
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span className="flex size-6 items-center justify-center rounded bg-primary/10 text-xs text-primary">
        {getTypeIcon(field.type)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{field.label}</p>
        <p className="text-[10px] text-muted-foreground">
          {field.type} {field.required && '· Required'}
        </p>
      </div>
    </div>
  );
}
