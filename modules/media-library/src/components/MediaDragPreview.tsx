'use client';

import { useEffect, useState } from 'react';
import { Image, FileText, Video } from 'lucide-react';
import type { MediaAsset } from '../types';

interface MediaDragPreviewProps {
  asset: MediaAsset;
  isDragging: boolean;
}

export function MediaDragPreview({ asset, isDragging }: MediaDragPreviewProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging]);

  if (!isDragging) return null;

  const isImage = asset.mimeType.startsWith('image/');
  const isVideo = asset.mimeType.startsWith('video/');

  return (
    <div
      className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-32 overflow-hidden rounded-lg border bg-card shadow-xl">
        <div className="aspect-[4/3] bg-muted">
          {isImage ? (
            <img
              src={asset.thumbnailUrl ?? asset.url ?? '/placeholder.svg'}
              alt={asset.alt ?? asset.filename}
              className="h-full w-full object-cover opacity-80"
              draggable={false}
            />
          ) : isVideo ? (
            <div className="flex h-full items-center justify-center opacity-80">
              <Video className="size-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center opacity-80">
              <FileText className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="border-t bg-background/95 px-2 py-1.5 backdrop-blur-sm">
          <p className="truncate text-[10px] font-medium text-foreground">
            {asset.filename}
          </p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Drop to set image
          </p>
        </div>
      </div>
    </div>
  );
}
