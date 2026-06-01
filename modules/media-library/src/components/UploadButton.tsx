'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Upload, Clipboard, Gauge } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { getUploadSpeed } from '../utils/fileUtils';

export function UploadButton({ onClick }: { onClick?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useMediaStore((s) => s.uploadFiles);
  const uploadQueue = useMediaStore((s) => s.uploadQueue);
  const [badgeCount, setBadgeCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const speedInterval = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  const pendingCount = uploadQueue.filter(
    (u) => u.status === 'pending' || u.status === 'uploading'
  ).length;

  useEffect(() => {
    setBadgeCount(pendingCount);
  }, [pendingCount]);

  const prevLoaded = useRef(0);

  useEffect(() => {
    const uploading = uploadQueue.filter((u) => u.status === 'uploading');
    if (uploading.length === 0) {
      setUploadSpeed(null);
      prevLoaded.current = 0;
      if (speedInterval.current) {
        clearInterval(speedInterval.current);
        speedInterval.current = undefined;
      }
      return;
    }

    const calc = () => {
      const queue = useMediaStore.getState().uploadQueue;
      const active = queue.filter((u) => u.status === 'uploading');
      const totalLoaded = active.reduce((s, u) => s + u.loaded, 0);
      const delta = totalLoaded - prevLoaded.current;
      prevLoaded.current = totalLoaded;
      if (delta > 0) {
        setUploadSpeed(getUploadSpeed(delta, 2));
      }
    };

    calc();
    speedInterval.current = setInterval(calc, 2000);

    return () => {
      if (speedInterval.current) {
        clearInterval(speedInterval.current);
        speedInterval.current = undefined;
      }
    };
  }, [uploadQueue]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      const related = (e as DragEvent).relatedTarget as Node | null;
      if (!related || related.ownerDocument?.body.contains(related) === false) {
        setDragOver(false);
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from((e as DragEvent).dataTransfer?.files ?? []);
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('paste', handlePaste);
    };
  }, [uploadFiles]);

  const handlePasteUpload = useCallback(async () => {
    try {
      const items = await (navigator as any).clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        for (const type of item.types) {
          const blob = await item.getType(type);
          if (
            blob.type.startsWith('image/') ||
            blob.type.startsWith('video/')
          ) {
            files.push(
              new File(
                [blob],
                `clipboard-${Date.now()}.${blob.type.split('/')[1]}`,
                { type: blob.type }
              )
            );
          }
        }
      }
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
    } catch {
      // Clipboard read not supported or denied
    }
  }, [uploadFiles]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      inputRef.current?.click();
    }
  }, [onClick]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
      (e.target as HTMLInputElement).value = '';
    },
    [uploadFiles]
  );

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90',
            dragOver && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <Upload className="size-3.5" />
          Upload
        </button>
        {badgeCount > 0 && (
          <span
            className={cn(
              'absolute -right-1.5 -top-1.5 flex items-center justify-center rounded-full text-[9px] font-bold text-destructive-foreground',
              uploadSpeed ? 'h-5 px-1.5' : 'size-4'
            )}
            style={{ background: 'hsl(var(--destructive))' }}
          >
            {uploadSpeed ? (
              <span className="flex items-center gap-0.5">
                <Gauge className="size-2.5" />
                {uploadSpeed}
              </span>
            ) : (
              badgeCount
            )}
          </span>
        )}
      </div>

      <button
        onClick={handlePasteUpload}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Upload from clipboard"
      >
        <Clipboard className="size-3.5" />
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
      />

      {dragOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/10">
          <div className="rounded-lg border-2 border-dashed border-primary bg-card px-12 py-8 shadow-2xl">
            <Upload className="mx-auto mb-3 size-10 text-primary" />
            <p className="text-lg font-semibold">
              Drop files anywhere to upload
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports images, videos, and documents
            </p>
          </div>
        </div>
      )}
    </>
  );
}
