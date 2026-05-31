'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { formatFileSize } from '../utils/fileUtils';
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  Link,
  Clipboard,
  Settings2,
  File,
  Image,
  Video,
  FileText,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { validateFiles } from '../utils/fileUtils';
import type { UploadProgress } from '../types';

interface UploadDialogProps {
  onClose: () => void;
}

type UploadTab = 'file' | 'url' | 'clipboard';

interface UploadSettings {
  autoOptimize: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  destinationFolder: string | null;
}

export function UploadDialog({ onClose }: UploadDialogProps) {
  const {
    uploadFiles,
    uploadFromUrl,
    cancelUpload,
    uploadQueue,
    currentFolder,
    folders,
  } = useMediaStore();

  const [tab, setTab] = useState<UploadTab>('file');
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<UploadSettings>({
    autoOptimize: true,
    compressionLevel: 'medium',
    destinationFolder: currentFolder,
  });
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clipboardInputRef = useRef<HTMLTextAreaElement>(null);

  const pendingUploads = uploadQueue.filter(
    (u) => u.status === 'pending' || u.status === 'uploading'
  );
  const completedCount = uploadQueue.filter(
    (u) => u.status === 'completed'
  ).length;
  const failedCount = uploadQueue.filter((u) => u.status === 'failed').length;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      const validation = validateFiles(files);
      if (validation.valid) {
        uploadFiles(files, settings.destinationFolder ?? undefined);
      } else {
        setValidationErrors(validation.errors);
      }
    },
    [uploadFiles, settings.destinationFolder]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const validation = validateFiles(files);
      if (validation.valid) {
        uploadFiles(files, settings.destinationFolder ?? undefined);
      } else {
        setValidationErrors(validation.errors);
      }
      e.target.value = '';
    },
    [uploadFiles, settings.destinationFolder]
  );

  const handleUrlUpload = useCallback(async () => {
    if (!url.trim()) return;
    setUrlLoading(true);
    await uploadFromUrl(url.trim(), settings.destinationFolder ?? undefined);
    setUrlLoading(false);
    setUrl('');
  }, [url, uploadFromUrl, settings.destinationFolder]);

  const handlePasteUpload = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        setUrl(text);
        setTab('url');
      }
    } catch {
      // Clipboard read not supported
    }
  }, []);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const files: File[] = [];

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        const validation = validateFiles(files);
        if (validation.valid) {
          uploadFiles(files, settings.destinationFolder ?? undefined);
        } else {
          setValidationErrors(validation.errors);
        }
      }
    },
    [uploadFiles, settings.destinationFolder]
  );

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="size-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="size-3 text-destructive" />;
      case 'uploading':
      case 'processing':
        return (
          <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      default:
        return <File className="size-3 text-muted-foreground" />;
    }
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[80vh] w-[520px] flex-col rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Upload Media</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'rounded p-1.5 transition-colors',
                showSettings
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Settings2 className="size-4" />
            </button>
            <button onClick={onClose} className="rounded p-1 hover:bg-accent">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="border-b bg-muted/20 px-6 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Auto-optimize</span>
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, autoOptimize: !s.autoOptimize }))
                }
                className={cn(
                  'h-5 w-9 rounded-full transition-colors',
                  settings.autoOptimize
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                )}
              >
                <div
                  className={cn(
                    'size-4 rounded-full bg-white transition-transform shadow-sm',
                    settings.autoOptimize
                      ? 'translate-x-[18px]'
                      : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Compression</span>
              <div className="flex rounded-md border text-[11px]">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setSettings((s) => ({ ...s, compressionLevel: level }))
                    }
                    className={cn(
                      'px-2 py-1 capitalize',
                      settings.compressionLevel === level
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Destination folder</span>
              <div className="relative">
                <button
                  onClick={() => setShowFolderPicker(!showFolderPicker)}
                  className="rounded border px-2 py-1 text-[11px] hover:bg-accent"
                >
                  {settings.destinationFolder
                    ? (folders.find((f) => f.id === settings.destinationFolder)
                        ?.name ?? 'Selected folder')
                    : 'Root folder'}
                </button>
                {showFolderPicker && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded border bg-card p-1 shadow-lg">
                    <button
                      onClick={() => {
                        setSettings((s) => ({ ...s, destinationFolder: null }));
                        setShowFolderPicker(false);
                      }}
                      className="w-full rounded px-2 py-1 text-left text-[11px] hover:bg-accent"
                    >
                      Root folder
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSettings((s) => ({
                            ...s,
                            destinationFolder: f.id,
                          }));
                          setShowFolderPicker(false);
                        }}
                        className="w-full rounded px-2 py-1 text-left text-[11px] hover:bg-accent"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b">
          {(
            [
              { key: 'file', label: 'Upload Files', icon: Upload },
              { key: 'url', label: 'From URL', icon: Link },
              { key: 'clipboard', label: 'Paste', icon: Clipboard },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                <AlertCircle className="size-3.5" />
                Validation errors
              </div>
              <ul className="mt-1 list-inside list-disc text-[11px] text-muted-foreground">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
              <button
                onClick={() => setValidationErrors([])}
                className="mt-1 text-[11px] text-primary hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {tab === 'file' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              <Upload className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {dragOver
                  ? 'Drop files here'
                  : 'Drop files here or click to browse'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, WebP, AVIF, GIF, MP4, PDF up to 10MB (100MB for video)
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                Max 20 files per upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Import a file from a public URL. Supported formats: images,
                videos, documents.
              </p>
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-9 flex-1 rounded-md border px-3 text-sm outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                />
                <button
                  onClick={handleUrlUpload}
                  disabled={!url.trim() || urlLoading}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {urlLoading ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Link className="size-4" />
                  )}
                  Import
                </button>
              </div>
            </div>
          )}

          {tab === 'clipboard' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste image from clipboard or paste a URL to import.
              </p>
              <textarea
                ref={clipboardInputRef}
                onPaste={handlePaste}
                placeholder="Paste content here (Ctrl+V / Cmd+V)..."
                className="h-24 w-full rounded-md border p-3 text-sm outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasteUpload}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  <Clipboard className="size-3.5" />
                  Paste from clipboard
                </button>
              </div>
            </div>
          )}

          {/* Upload queue */}
          {uploadQueue.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Upload queue ({uploadQueue.length})
                </span>
                {(completedCount > 0 || failedCount > 0) && (
                  <button
                    onClick={() =>
                      useMediaStore.getState().clearCompletedUploads()
                    }
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Clear completed
                  </button>
                )}
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto">
                {uploadQueue.map((entry) => (
                  <div
                    key={entry.fileId}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 text-xs',
                      entry.status === 'failed' &&
                        'border-destructive/30 bg-destructive/5',
                      entry.status === 'completed' &&
                        'border-green-500/20 bg-green-500/5'
                    )}
                  >
                    {getStatusIcon(entry.status)}

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{entry.filename}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-all',
                              entry.status === 'failed'
                                ? 'bg-destructive'
                                : entry.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-primary'
                            )}
                            style={{ width: `${entry.percentage}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          {entry.percentage}%
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>
                          {formatFileSize(entry.loaded)} /{' '}
                          {formatFileSize(entry.total)}
                        </span>
                        {entry.status === 'uploading' && entry.loaded > 0 && (
                          <>
                            <span>·</span>
                            <span>
                              {formatSpeed(
                                entry.loaded /
                                  Math.max(1, Date.now() - Date.now() + 1000)
                              )}
                            </span>
                            <span>·</span>
                            <span>
                              {formatTimeRemaining(
                                ((entry.total - entry.loaded) /
                                  Math.max(1, entry.loaded)) *
                                  1
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {entry.status === 'pending' && (
                        <button
                          onClick={() => cancelUpload(entry.fileId)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                          title="Cancel"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                      {entry.status === 'uploading' && (
                        <button
                          onClick={() => cancelUpload(entry.fileId)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                          title="Cancel"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                      {entry.status === 'failed' && (
                        <button
                          onClick={() =>
                            useMediaStore.getState().retryUpload(entry.fileId)
                          }
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Retry"
                        >
                          <Upload className="size-3" />
                        </button>
                      )}
                      {entry.status === 'completed' && (
                        <button
                          onClick={() => cancelUpload(entry.fileId)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Remove"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {entry.error && (
                      <div className="text-[10px] text-destructive">
                        {entry.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <div className="text-[11px] text-muted-foreground">
            {completedCount > 0 && <span>{completedCount} uploaded</span>}
            {failedCount > 0 && (
              <span className="ml-2 text-destructive">
                {failedCount} failed
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {pendingUploads.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {pendingUploads.length} uploading...
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-md border px-4 py-1.5 text-xs font-medium hover:bg-accent"
            >
              {pendingUploads.length > 0 ? 'Minimize' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
