'use client';

import { useCallback, useState } from 'react';
import { Clipboard, Upload, X } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

interface ClipboardUploadProps {
  folderId?: string;
  className?: string;
}

export function ClipboardUpload({ folderId, className }: ClipboardUploadProps) {
  const uploadFiles = useMediaStore((s) => s.uploadFiles);
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        await uploadFiles(files, folderId);
      }
    },
    [uploadFiles, folderId]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await uploadFiles(files, folderId);
      }
    },
    [uploadFiles, folderId]
  );

  return (
    <div
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        className
      )}
    >
      <Clipboard className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Paste from clipboard or drag & drop files
      </p>
      <p className="text-xs text-muted-foreground">
        Press Ctrl+V / Cmd+V to paste images
      </p>
    </div>
  );
}
