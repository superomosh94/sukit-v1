'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Upload, Clipboard } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

export function UploadButton({ onClick }: { onClick?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useMediaStore((s) => s.uploadFiles);
  const uploadQueue = useMediaStore((s) => s.uploadQueue);
  const [badgeCount, setBadgeCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const pendingCount = uploadQueue.filter(
    (u) => u.status === 'pending' || u.status === 'uploading'
  ).length;

  useEffect(() => {
    setBadgeCount(pendingCount);
  }, [pendingCount]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      const related = e.relatedTarget as Node | null;
      if (!related || related.ownerDocument?.body.contains(related) === false) {
        setDragOver(false);
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [uploadFiles]);

  const handlePasteUpload = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
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
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        uploadFiles(files, useMediaStore.getState().currentFolder ?? undefined);
      }
      e.target.value = '';
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
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {badgeCount}
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
