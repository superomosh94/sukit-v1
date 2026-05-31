'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

export function FormValidator() {
  const sections = useBuilderStore((s) => s.sections);

  const { formCount, issues } = useMemo(() => {
    const issues: ValidationIssue[] = [];
    let formCount = 0;

    for (const section of sections) {
      for (const column of section.columns) {
        for (const block of column.blocks) {
          if (block.blockType === 'form') {
            formCount++;
            const props = block.props as Record<string, unknown>;
            const fields = (props.fields ?? []) as Array<{
              label: string;
              type: string;
            }>;

            for (const field of fields) {
              if (!field.label || field.label.trim() === '') {
                issues.push({
                  type: 'error',
                  message:
                    'Form field without a label — screen readers cannot identify it',
                });
              }
              if (field.type === 'select' && !field.label) {
                issues.push({
                  type: 'warning',
                  message: 'Select field missing a label for accessibility',
                });
              }
            }
          }
        }
      }
    }

    return { formCount, issues };
  }, [sections]);

  if (formCount === 0) return null;

  return (
    <div className="space-y-1 px-3 pb-2">
      <div className="flex items-center gap-1.5 pt-1 pb-1">
        {issues.length === 0 ? (
          <CheckCircle2 className="size-3 text-green-500" />
        ) : (
          <AlertTriangle className="size-3 text-amber-500" />
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Forms ({formCount})
        </span>
      </div>

      {issues.map((issue, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-1.5 rounded px-1.5 py-1',
            issue.type === 'error'
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
          )}
        >
          {issue.type === 'error' ? (
            <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          ) : (
            <Info className="mt-0.5 size-3 shrink-0" />
          )}
          <span className="text-[11px] leading-tight">{issue.message}</span>
        </div>
      ))}
    </div>
  );
}
