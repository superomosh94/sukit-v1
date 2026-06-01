'use client';

import { useMemo } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useSeoStore, type SeoAnalysisIssue } from '../stores/seoStore';
import { cn } from '../utils/cn';

interface SeoDashboardProps {
  className?: string;
}

export function SeoDashboard({ className }: SeoDashboardProps) {
  const score = useSeoStore((s) => s.score);
  const issues = useSeoStore((s) => s.issues);

  const scoreColor = useMemo(() => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  }, [score]);

  const gaugeAngle = useMemo(() => (score / 100) * 180, [score]);

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const passCount = issues.filter((i) => i.type === 'pass').length;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-3">
        <Search className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">SEO Analysis</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6">
          <div className="relative mb-2">
            <svg width="120" height="80" viewBox="0 0 120 80">
              <path
                d="M10,70 A50,50 0 0,1 110,70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d={`M10,70 A50,50 0 0,1 ${10 + 100 * Math.sin((gaugeAngle * Math.PI) / 180)},${70 - 50 * (1 - Math.cos((gaugeAngle * Math.PI) / 180))}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-2xl font-bold', scoreColor)}>
                {score}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">SEO Score</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertCircle className="size-4" />
            <span className="text-sm font-medium">Errors</span>
          </div>
          <p className="text-2xl font-bold">{errorCount}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <AlertTriangle className="size-4" />
            <span className="text-sm font-medium">Warnings</span>
          </div>
          <p className="text-2xl font-bold">{warningCount}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle className="size-4" />
            <span className="text-sm font-medium">Passed</span>
          </div>
          <p className="text-2xl font-bold">{passCount}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-2">
          <h3 className="text-sm font-medium">Issues & Recommendations</h3>
        </div>
        <div className="divide-y">
          {issues.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No issues found. Run an analysis to get started.
            </div>
          ) : (
            issues.map((issue, i) => <IssueItem key={i} issue={issue} />)
          )}
        </div>
      </div>
    </div>
  );
}

function IssueItem({ issue }: { issue: SeoAnalysisIssue }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {issue.type === 'error' && (
        <AlertCircle className="size-4 mt-0.5 shrink-0 text-red-500" />
      )}
      {issue.type === 'warning' && (
        <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-500" />
      )}
      {issue.type === 'pass' && (
        <CheckCircle className="size-4 mt-0.5 shrink-0 text-green-500" />
      )}
      <div>
        <p className="text-sm">{issue.message}</p>
        {issue.recommendation && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {issue.recommendation}
          </p>
        )}
      </div>
    </div>
  );
}
