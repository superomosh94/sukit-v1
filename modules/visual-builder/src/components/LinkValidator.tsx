'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

interface LinkInfo {
  id: string;
  text: string;
  href: string;
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

const GENERIC_LABELS = [
  'click here',
  'here',
  'read more',
  'learn more',
  'more',
  'link',
  'this',
  'go',
];

export function LinkValidator() {
  const sections = useBuilderStore((s) => s.sections);

  const { links, issues } = useMemo(() => {
    const links: LinkInfo[] = [];
    const issues: ValidationIssue[] = [];

    for (const section of sections) {
      for (const column of section.columns) {
        for (const block of column.blocks) {
          const props = block.props as Record<string, unknown>;
          const text = (props.text as string) ?? '';
          const href = (props.href as string) ?? '';

          if (block.blockType === 'link' || block.blockType === 'button') {
            links.push({ id: block.id, text, href });

            if (!text || text.trim().length === 0) {
              issues.push({
                type: 'error',
                message: `Link with empty text (${href || 'no href'})`,
              });
            } else {
              const trimmed = text.trim().toLowerCase();
              if (GENERIC_LABELS.includes(trimmed)) {
                issues.push({
                  type: 'warning',
                  message: `Generic link text "${text}" — use descriptive text`,
                });
              }
            }

            if (
              href &&
              href.startsWith('http') &&
              !href.startsWith('https://')
            ) {
              issues.push({
                type: 'warning',
                message: `Link uses http:// instead of https:// (${href})`,
              });
            }
          }
        }
      }
    }

    return { links, issues };
  }, [sections]);

  if (links.length === 0) return null;

  return (
    <div className="space-y-1 px-3 pb-2">
      <div className="flex items-center gap-1.5 pt-1 pb-1">
        {issues.length === 0 ? (
          <CheckCircle2 className="size-3 text-green-500" />
        ) : (
          <AlertTriangle className="size-3 text-amber-500" />
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Links ({links.length})
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
