'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  File,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import type { UploadProgress } from '../types';
import { cn } from '../utils/cn';

interface BulkUploadProps {
  folderId?: string;
  className?: string;
}

export function BulkUpload({ folderId, className }: BulkUploadProps) {
  const uploadFiles = useMediaStore((s) => s.uploadFiles);
  const uploadQueue = useMediaStore((s) => s.uploadQueue);
  const cancelUpload = useMediaStore((s) => s.cancelUpload);
  const pauseUpload = useMediaStore((s) => s.pauseUpload);
  const resumeUpload = useMediaStore((s) => s.resumeUpload);
  const retryUpload = useMediaStore((s) => s.retryUpload);
  const clearCompletedUploads = useMediaStore((s) => s.clearCompletedUploads);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      uploadFiles(Array.from(files), folderId);
    },
    [uploadFiles, folderId]
  );

  const activeUploads = uploadQueue.filter(
    (u) =>
      u.status === 'pending' ||
      u.status === 'uploading' ||
      u.status === 'processing'
  );
  const completedUploads = uploadQueue.filter((u) => u.status === 'completed');
  const failedUploads = uploadQueue.filter((u) => u.status === 'failed');

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragOver && 'border-primary bg-primary/5'
        )}
      >
        <Upload className="size-10 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground">
          Supports images, videos, documents
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploadQueue.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">
              Upload Queue ({uploadQueue.length})
            </h4>
            {completedUploads.length > 0 && (
              <button
                onClick={clearCompletedUploads}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear completed
              </button>
            )}
          </div>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {uploadQueue.map((item) => (
              <UploadQueueItem
                key={item.fileId}
                item={item}
                onCancel={() => cancelUpload(item.fileId)}
                onPause={() => pauseUpload(item.fileId)}
                onResume={() => resumeUpload(item.fileId)}
                onRetry={() => retryUpload(item.fileId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadQueueItem({
  item,
  onCancel,
  onPause,
  onResume,
  onRetry,
}: {
  item: UploadProgress;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
}) {
  const isActive =
    item.status === 'pending' ||
    item.status === 'uploading' ||
    item.status === 'processing';
  const isCompleted = item.status === 'completed';
  const isFailed = item.status === 'failed';
  const isPaused = item.status === 'pending';

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
      {isCompleted ? (
        <CheckCircle className="size-4 shrink-0 text-green-500" />
      ) : isFailed ? (
        <AlertCircle className="size-4 shrink-0 text-red-500" />
      ) : (
        <File className="size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{item.filename}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isCompleted
                  ? 'bg-green-500'
                  : isFailed
                    ? 'bg-red-500'
                    : 'bg-primary'
              )}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {item.percentage}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isActive && !isPaused && (
          <button
            onClick={onPause}
            className="rounded p-1 hover:bg-accent"
            title="Pause"
          >
            <Pause className="size-3" />
          </button>
        )}
        {isPaused && (
          <button
            onClick={onResume}
            className="rounded p-1 hover:bg-accent"
            title="Resume"
          >
            <Play className="size-3" />
          </button>
        )}
        {isFailed && (
          <button
            onClick={onRetry}
            className="rounded p-1 hover:bg-accent"
            title="Retry"
          >
            <Loader2 className="size-3" />
          </button>
        )}
        <button
          onClick={onCancel}
          className="rounded p-1 hover:bg-accent text-destructive"
          title="Cancel"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
