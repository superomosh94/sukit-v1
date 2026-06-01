'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  label?: string;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  label,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; size: number }[]>(
    []
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => f.size <= maxSize);
    setPreviews(validFiles.map((f) => ({ name: f.name, size: f.size })));
    onUpload(validFiles);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <Upload size={24} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drop files here or click to browse
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Max file size: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {previews.length > 0 && (
        <div className="mt-2 space-y-1">
          {previews.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted rounded-md"
            >
              <File size={14} className="text-muted-foreground" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {Math.round(file.size / 1024)}KB
              </span>
              <button
                onClick={() =>
                  setPreviews((prev) => prev.filter((_, j) => j !== i))
                }
                className="p-0.5 rounded hover:bg-accent"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
