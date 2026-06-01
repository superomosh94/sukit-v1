'use client';

import { useState } from 'react';
import { GitBranch, Check, ChevronDown } from 'lucide-react';
import { useCodeEditorStore } from '../stores/codeEditorStore';
import { cn } from '../utils/cn';

interface GitBranchDropdownProps {
  className?: string;
}

export function GitBranchDropdown({ className }: GitBranchDropdownProps) {
  const currentBranch = useCodeEditorStore((s) => s.git.currentBranch);
  const branches = useCodeEditorStore((s) => s.git.branches);
  const setGitBranch = useCodeEditorStore((s) => s.setGitBranch);
  const [open, setOpen] = useState(false);

  const handleSwitchBranch = async (branch: string) => {
    try {
      await fetch('/api/code-editor/git/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch }),
      });
      setGitBranch(branch);
    } catch (err) {
      console.error('Failed to switch branch:', err);
    }
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
      >
        <GitBranch className="size-3.5 text-muted-foreground" />
        <span>{currentBranch}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[160px] rounded-lg border bg-card py-1 shadow-xl">
          <div className="border-b px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase">
            Branches
          </div>
          {branches.map((branch) => (
            <button
              key={branch}
              onClick={() => handleSwitchBranch(branch)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent',
                branch === currentBranch && 'bg-accent/50'
              )}
            >
              {branch === currentBranch && (
                <Check className="size-3 text-primary" />
              )}
              <span className={branch === currentBranch ? 'font-medium' : ''}>
                {branch}
              </span>
            </button>
          ))}
          <div className="border-t px-3 py-1.5">
            <button
              onClick={() => {
                const name = prompt('Enter new branch name:');
                if (name) handleSwitchBranch(name);
              }}
              className="text-xs text-primary hover:underline"
            >
              + New Branch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
