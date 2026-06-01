'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface MediaUploaderProps {
  onUploadComplete?: (files: { url: string; filename: string }[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
];

export default function MediaUploader({
  onUploadComplete,
  accept = ACCEPTED_TYPES.join(','),
  maxFiles = 10,
  maxSizeMB = 10,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (uploadFile: UploadFile, index: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file === uploadFile.file ? { ...f, status: 'uploading' as const } : f
      )
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 5;
      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? { ...f, progress: 100, status: 'done' as const }
              : f
          )
        );
        const allDone = files.every(
          (f) => f.status === 'done' || f.file === uploadFile.file
        );
        if (allDone) {
          onUploadComplete?.(
            files.map((f) => ({
              url: f.preview || URL.createObjectURL(f.file),
              filename: f.file.name,
            }))
          );
        }
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? { ...f, progress: Math.min(progress, 99) }
              : f
          )
        );
      }
    }, 200);
  };

  const addFiles = useCallback(
    (incoming: File[]) => {
      const remaining = maxFiles - files.length;
      const toAdd = incoming.slice(0, remaining);

      const newFiles: UploadFile[] = toAdd.map((file) => ({
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : '',
        progress: 0,
        status: 'pending' as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((f, i) => simulateUpload(f, i + files.length));
    },
    [files.length, maxFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );
      if (dropped.length > 0) addFiles(dropped);
    },
    [addFiles]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(Array.from(e.target.files));
    },
    [addFiles]
  );

  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
      : 0;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, up to {maxSizeMB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleInput}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {files.filter((f) => f.status === 'done').length}/{files.length}{' '}
              uploaded
            </span>
            {totalProgress < 100 && (
              <span className="text-xs">{totalProgress}%</span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              {f.file.type.startsWith('image/') ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted">
                  <File className="size-8 text-muted-foreground" />
                </div>
              )}

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">{f.file.name}</p>
                <p className="text-xs text-white/70">
                  {(f.file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>

              {f.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
