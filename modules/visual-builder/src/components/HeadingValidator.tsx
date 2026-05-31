'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

interface HeadingInfo {
  id: string;
  tag: string;
  text: string;
  level: number;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

export function HeadingValidator() {
  const sections = useBuilderStore((s) => s.sections);

  const { headings, issues } = useMemo(() => {
    const headings: HeadingInfo[] = [];
    const issues: ValidationIssue[] = [];

    for (const section of sections) {
      for (const column of section.columns) {
        for (const block of column.blocks) {
          if (
            block.blockType === 'heading' &&
            typeof block.props === 'object' &&
            block.props !== null
          ) {
            const level =
              ((block.props as Record<string, unknown>).level as number) ?? 2;
            const text =
              ((block.props as Record<string, unknown>).text as string) ?? '';
            headings.push({
              id: block.id,
              tag: `h${level}`,
              text: text.slice(0, 60),
              level,
            });
          }
        }
      }
    }

    // Check: only one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    if (h1Count > 1) {
      issues.push({
        type: 'error',
        message: `Multiple <h1> elements found (${h1Count}). Use only one <h1> per page.`,
      });
    } else if (h1Count === 0 && headings.length > 0) {
      issues.push({
        type: 'warning',
        message: 'No <h1> element found. Consider adding a top-level heading.',
      });
    }

    // Check: no skipped levels
    let expectedLevel = 1;
    for (const h of headings) {
      if (h.level > expectedLevel + 1) {
        issues.push({
          type: 'warning',
          message: `Skipped heading level: ${expectedLevel + 1} → ${h.tag} "${h.text}"`,
        });
      }
      expectedLevel = h.level;
    }

    return { headings, issues };
  }, [sections]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-1 px-3 pb-2">
      <div className="flex items-center gap-1.5 pt-2 pb-1">
        {issues.length === 0 ? (
          <CheckCircle2 className="size-3 text-green-500" />
        ) : (
          <AlertTriangle className="size-3 text-amber-500" />
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Heading Structure
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

      <div className="flex flex-wrap gap-1 pt-1">
        {headings.map((h) => (
          <span
            key={h.id}
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-mono',
              h.level === 1 &&
                'bg-blue-500/10 text-blue-600 dark:text-blue-400',
              h.level === 2 &&
                'bg-green-500/10 text-green-600 dark:text-green-400',
              h.level === 3 &&
                'bg-amber-500/10 text-amber-700 dark:text-amber-300',
              h.level >= 4 && 'bg-muted text-muted-foreground'
            )}
          >
            {h.tag}: {h.text}
          </span>
        ))}
      </div>
    </div>
  );
}
