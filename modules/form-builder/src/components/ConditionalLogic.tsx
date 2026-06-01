'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  useFormBuilderStore,
  type ConditionalRule,
  type FormField,
} from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

const OPERATORS = [
  { value: 'equals' as const, label: 'Equals' },
  { value: 'not-equals' as const, label: 'Not equals' },
  { value: 'contains' as const, label: 'Contains' },
  { value: 'greater-than' as const, label: 'Greater than' },
  { value: 'less-than' as const, label: 'Less than' },
  { value: 'is-empty' as const, label: 'Is empty' },
  { value: 'is-not-empty' as const, label: 'Is not empty' },
];

const ACTIONS = [
  { value: 'show' as const, label: 'Show' },
  { value: 'hide' as const, label: 'Hide' },
  { value: 'require' as const, label: 'Require' },
  { value: 'disable' as const, label: 'Disable' },
];

interface ConditionalLogicProps {
  fieldId: string;
  rules?: ConditionalRule[];
  className?: string;
}

export function ConditionalLogic({
  fieldId,
  rules = [],
  className,
}: ConditionalLogicProps) {
  const fields = useFormBuilderStore((s) => s.fields);
  const updateField = useFormBuilderStore((s) => s.updateField);

  const addRule = () => {
    const otherField = fields.find((f) => f.id !== fieldId);
    if (!otherField) return;
    const newRule: ConditionalRule = {
      fieldId: otherField.id,
      operator: 'equals',
      value: '',
      action: 'show',
    };
    updateField(fieldId, { conditionalLogic: [...rules, newRule] });
  };

  const updateRule = (index: number, data: Partial<ConditionalRule>) => {
    const updated = rules.map((r, i) => (i === index ? { ...r, ...data } : r));
    updateField(fieldId, { conditionalLogic: updated });
  };

  const removeRule = (index: number) => {
    updateField(fieldId, {
      conditionalLogic: rules.filter((_, i) => i !== index),
    });
  };

  const otherFields = fields.filter((f) => f.id !== fieldId);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">
          Conditional Logic
        </h4>
        <button
          onClick={addRule}
          disabled={otherFields.length === 0}
          className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
        >
          <Plus className="size-3" /> Add Rule
        </button>
      </div>

      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No conditional rules set
        </p>
      )}

      {rules.map((rule, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-md border bg-background p-2 text-xs"
        >
          <select
            value={rule.action}
            onChange={(e) =>
              updateRule(index, { action: e.target.value as any })
            }
            className="h-7 rounded border bg-background px-1 text-xs"
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          <span className="text-muted-foreground">if</span>

          <select
            value={rule.fieldId}
            onChange={(e) => updateRule(index, { fieldId: e.target.value })}
            className="h-7 rounded border bg-background px-1 text-xs"
          >
            {otherFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={rule.operator}
            onChange={(e) =>
              updateRule(index, { operator: e.target.value as any })
            }
            className="h-7 rounded border bg-background px-1 text-xs"
          >
            {OPERATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {rule.operator !== 'is-empty' && rule.operator !== 'is-not-empty' && (
            <input
              type="text"
              value={rule.value}
              onChange={(e) => updateRule(index, { value: e.target.value })}
              placeholder="Value"
              className="h-7 w-20 rounded border bg-background px-2 text-xs"
            />
          )}

          <button
            onClick={() => removeRule(index)}
            className="rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
