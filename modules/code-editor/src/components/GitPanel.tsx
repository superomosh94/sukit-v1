'use client';

import { useEffect, useState } from 'react';
import {
  GitCommit,
  GitPullRequest,
  GitBranch,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useCodeEditorStore } from '../stores/codeEditorStore';
import { GitBranchDropdown } from './GitBranchDropdown';
import { cn } from '../utils/cn';

interface GitPanelProps {
  className?: string;
}

export function GitPanel({ className }: GitPanelProps) {
  const git = useCodeEditorStore((s) => s.git);
  const setGitStatus = useCodeEditorStore((s) => s.setGitStatus);
  const setCommitHistory = useCodeEditorStore((s) => s.setCommitHistory);
  const setGitSyncing = useCodeEditorStore((s) => s.setGitSyncing);
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    fetchGitStatus();
    fetchCommitHistory();
  }, []);

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/code-editor/git/status');
      const data = await res.json();
      setGitStatus(data.status ?? []);
    } catch {}
  };

  const fetchCommitHistory = async () => {
    try {
      const res = await fetch('/api/code-editor/git/log');
      const data = await res.json();
      setCommitHistory(data.log ?? []);
    } catch {}
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    try {
      await fetch('/api/code-editor/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage }),
      });
      setCommitMessage('');
      fetchGitStatus();
      fetchCommitHistory();
    } catch (err) {
      console.error('Commit failed:', err);
    }
  };

  const handlePush = async () => {
    setGitSyncing(true);
    try {
      await fetch('/api/code-editor/git/push', { method: 'POST' });
    } catch {}
    setGitSyncing(false);
  };

  const handlePull = async () => {
    setGitSyncing(true);
    try {
      await fetch('/api/code-editor/git/pull', { method: 'POST' });
      fetchGitStatus();
    } catch {}
    setGitSyncing(false);
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium">Git</span>
        </div>
        <GitBranchDropdown />
      </div>

      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button
          onClick={handlePull}
          disabled={git.isSyncing}
          className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium hover:bg-accent disabled:opacity-50"
        >
          <ArrowDown className="size-3" />
          Pull
        </button>
        <button
          onClick={handlePush}
          disabled={git.isSyncing}
          className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium hover:bg-accent disabled:opacity-50"
        >
          <ArrowUp className="size-3" />
          Push
        </button>
        <button
          onClick={fetchGitStatus}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <RefreshCw className="size-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {git.status.length > 0 && (
          <div className="border-b p-3">
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
              Changes ({git.status.length})
            </h4>
            <div className="space-y-1">
              {git.status.map(({ path, status }) => (
                <div key={path} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'w-14 rounded px-1 py-0.5 text-center text-[9px] font-medium uppercase',
                      status === 'M' &&
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      status === 'A' &&
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      status === 'D' &&
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      status === '?' &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}
                  >
                    {status === 'M'
                      ? 'Mod'
                      : status === 'A'
                        ? 'Add'
                        : status === 'D'
                          ? 'Del'
                          : 'Untracked'}
                  </span>
                  <span className="truncate font-mono">{path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message..."
              className="h-8 flex-1 rounded-md border bg-background px-3 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
            />
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              <GitCommit className="size-3" />
              Commit
            </button>
          </div>
        </div>

        {git.commitHistory.length > 0 && (
          <div className="border-t p-3">
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
              History
            </h4>
            <div className="space-y-2">
              {git.commitHistory.slice(0, 10).map((commit) => (
                <div key={commit.hash} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {commit.hash.slice(0, 7)}
                    </span>
                    <span className="font-medium truncate">
                      {commit.message}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {commit.author} ·{' '}
                    {new Date(commit.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
