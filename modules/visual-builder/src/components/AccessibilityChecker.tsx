'use client';

import { useMemo, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Info, Wrench } from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';
import { showToast } from './Toast';

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  blockId?: string;
  sectionId?: string;
  columnId?: string;
  field?: { key: string; value: unknown };
  autoFix?: () => void;
}

export function AccessibilityChecker() {
  const sections = useBuilderStore((s) => s.sections);
  const updateBlock = useBuilderStore((s) => s.updateBlock);

  const issues = useMemo(() => {
    const issues: ValidationIssue[] = [];

    for (const section of sections) {
      for (const column of section.columns) {
        for (const block of column.blocks) {
          const props = block.props as Record<string, unknown>;

          // Check images for alt text
          if (block.blockType === 'image' && !props.alt) {
            issues.push({
              type: 'warning',
              message: 'Image is missing alt text for screen readers',
              blockId: block.id,
              sectionId: section.id,
              columnId: column.id,
              autoFix: () => {
                const filename =
                  ((props.src as string) ?? '').split('/').pop() ?? 'image';
                const alt = filename
                  .replace(/[.-]/g, ' ')
                  .replace(/\.[^.]+$/, '');
                updateBlock(section.id, column.id, block.id, {
                  props: { ...block.props, alt: alt },
                });
                showToast('Alt text auto-fixed', 'success');
              },
            });
          }

          // Check form fields for labels
          if (block.blockType === 'form') {
            const fields = (props.fields ?? []) as Array<{
              label: string;
              type: string;
            }>;
            fields.forEach((field, i) => {
              if (!field.label || field.label.trim() === '') {
                issues.push({
                  type: 'error',
                  message: `Form field #${i + 1} missing label — screen readers cannot identify it`,
                  blockId: block.id,
                  sectionId: section.id,
                  columnId: column.id,
                  autoFix: () => {
                    const updated = [...fields];
                    updated[i] = { ...updated[i], label: `Field ${i + 1}` };
                    updateBlock(section.id, column.id, block.id, {
                      props: { ...block.props, fields: updated },
                    });
                    showToast('Form field label auto-fixed', 'success');
                  },
                });
              }
            });
          }

          // Check headings for hierarchy
          if (block.blockType === 'heading') {
            const level = (props.level as number) ?? 1;
            if (level > 6) {
              issues.push({
                type: 'error',
                message: `Heading level ${level} is invalid — levels 1-6 only`,
                blockId: block.id,
                sectionId: section.id,
                columnId: column.id,
                autoFix: () => {
                  updateBlock(section.id, column.id, block.id, {
                    props: { ...block.props, level: 6 },
                  });
                  showToast('Heading level auto-fixed to h6', 'success');
                },
              });
            }
          }

          // Check links for empty href
          if (
            (block.blockType === 'link' || block.blockType === 'button') &&
            !props.href &&
            !props.url
          ) {
            issues.push({
              type: 'warning',
              message: `${block.blockType.charAt(0).toUpperCase() + block.blockType.slice(1)} has no URL — may confuse users`,
              blockId: block.id,
              sectionId: section.id,
              columnId: column.id,
            });
          }
        }
      }
    }

    return issues;
  }, [sections, updateBlock]);

  if (issues.length === 0) return null;

  return (
    <div className="space-y-1 px-3 pb-2">
      <div className="flex items-center gap-1.5 pt-1 pb-1">
        {issues.filter((i) => i.type === 'error').length === 0 ? (
          <CheckCircle2 className="size-3 text-green-500" />
        ) : (
          <AlertTriangle className="size-3 text-amber-500" />
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Accessibility ({issues.length} issue{issues.length > 1 ? 's' : ''})
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
          <span className="text-[11px] leading-tight flex-1">
            {issue.message}
          </span>
          {issue.autoFix && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                issue.autoFix?.();
              }}
              className="shrink-0 rounded border border-current px-1 py-0.5 text-[9px] font-medium hover:bg-current/10"
              title="Auto-fix this issue"
            >
              <Wrench className="size-2.5 inline mr-0.5" />
              Fix
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
