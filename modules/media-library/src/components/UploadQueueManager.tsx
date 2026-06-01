'use client';

import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { UploadProgress } from '../types';

interface UploadQueueManagerProps {
  className?: string;
}

export function UploadQueueManager({ className }: UploadQueueManagerProps) {
  const uploadQueue = useMediaStore((s) => s.uploadQueue);
  const pauseUpload = useMediaStore((s) => s.pauseUpload);
  const resumeUpload = useMediaStore((s) => s.resumeUpload);
  const cancelUpload = useMediaStore((s) => s.cancelUpload);
  const retryUpload = useMediaStore((s) => s.retryUpload);
  const clearCompletedUploads = useMediaStore((s) => s.clearCompletedUploads);

  const stats = {
    total: uploadQueue.length,
    uploading: uploadQueue.filter((u) => u.status === 'uploading').length,
    completed: uploadQueue.filter((u) => u.status === 'completed').length,
    failed: uploadQueue.filter((u) => u.status === 'failed').length,
    pending: uploadQueue.filter((u) => u.status === 'pending').length,
  };

  if (!uploadQueue.length) return null;

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-medium">Upload Queue</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.total} total</span>
          {stats.uploading > 0 && <span>{stats.uploading} uploading</span>}
          {stats.completed > 0 && <span>{stats.completed} done</span>}
          {stats.failed > 0 && (
            <span className="text-red-500">{stats.failed} failed</span>
          )}
        </div>
      </div>
      <div className="max-h-80 divide-y overflow-y-auto">
        {uploadQueue.map((item) => (
          <UploadQueueRow
            key={item.fileId}
            item={item}
            onPause={() => pauseUpload(item.fileId)}
            onResume={() => resumeUpload(item.fileId)}
            onCancel={() => cancelUpload(item.fileId)}
            onRetry={() => retryUpload(item.fileId)}
          />
        ))}
      </div>
      {stats.completed > 0 && (
        <div className="border-t px-4 py-2">
          <button
            onClick={clearCompletedUploads}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}

function UploadQueueRow({
  item,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: {
  item: UploadProgress;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const isActive = item.status === 'uploading';
  const isPending = item.status === 'pending';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{item.filename}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                item.status === 'completed' && 'bg-green-500',
                item.status === 'failed' && 'bg-red-500',
                (isActive || isPending) && 'bg-primary'
              )}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {item.percentage}%
          </span>
          {item.status === 'uploading' && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatBytes(item.loaded)}/{formatBytes(item.total)}
            </span>
          )}
        </div>
        {item.error && (
          <p className="mt-0.5 text-xs text-red-500">{item.error}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isActive && (
          <button
            onClick={onPause}
            className="rounded p-1 hover:bg-accent text-muted-foreground"
            title="Pause"
          >
            ⏸
          </button>
        )}
        {isPending && (
          <button
            onClick={onResume}
            className="rounded p-1 hover:bg-accent text-muted-foreground"
            title="Resume"
          >
            ▶
          </button>
        )}
        {item.status === 'failed' && (
          <button
            onClick={onRetry}
            className="rounded p-1 hover:bg-accent text-muted-foreground"
            title="Retry"
          >
            🔄
          </button>
        )}
        <button
          onClick={onCancel}
          className="rounded p-1 hover:bg-accent text-red-500"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
