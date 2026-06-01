'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useFormBuilderStore } from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

interface MultiStepEditorProps {
  className?: string;
}

export function MultiStepEditor({ className }: MultiStepEditorProps) {
  const steps = useFormBuilderStore((s) => s.steps);
  const fields = useFormBuilderStore((s) => s.fields);
  const addStep = useFormBuilderStore((s) => s.addStep);
  const removeStep = useFormBuilderStore((s) => s.removeStep);
  const updateStep = useFormBuilderStore((s) => s.updateStep);

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Multi-Step Form</h3>
        <button
          onClick={() => addStep(`Step ${steps.length + 1}`)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="size-3" /> Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No steps defined. Form will render as single page.
        </p>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-md border bg-background p-3">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) =>
                    updateStep(step.id, { title: e.target.value })
                  }
                  className="h-7 flex-1 rounded border bg-background px-2 text-xs font-medium"
                />
                <button
                  onClick={() => removeStep(step.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
              <input
                type="text"
                value={step.description ?? ''}
                onChange={(e) =>
                  updateStep(step.id, { description: e.target.value })
                }
                placeholder="Step description (optional)"
                className="h-7 w-full rounded border bg-background px-2 text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
