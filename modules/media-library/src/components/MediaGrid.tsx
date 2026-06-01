'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Star,
  Video,
  FileText,
  Check,
  Copy,
  Download,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize, formatDimensions } from '../utils/fileUtils';
import type { MediaAsset } from '../types';

interface MediaGridProps {
  assets: MediaAsset[];
}

export function MediaGrid({ assets }: MediaGridProps) {
  const {
    selectedIds,
    toggleSelection,
    setCurrentAsset,
    toggleFavorite,
    deleteAsset,
    getUrl,
    copyUrl,
  } = useMediaStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    assetId: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleClick = useCallback(
    (asset: MediaAsset, index: number, e: React.MouseEvent) => {
      if (e.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        for (let i = start; i <= end; i++) {
          if (!selectedIds.includes(assets[i].id)) {
            toggleSelection(assets[i].id);
          }
        }
      } else {
        setCurrentAsset(asset.id);
      }
      setLastClickedIndex(index);
    },
    [lastClickedIndex, selectedIds, assets, toggleSelection, setCurrentAsset]
  );

  const handleDoubleClick = useCallback(
    (asset: MediaAsset) => {
      setCurrentAsset(asset.id);
    },
    [setCurrentAsset]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, assetId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, assetId });
    },
    []
  );

  const handleCopyUrl = useCallback(
    (assetId: string, format: 'direct' | 'markdown' | 'html') => {
      const text = copyUrl(assetId, format);
      (navigator as any).clipboard.writeText(text);
      setCopiedId(assetId);
      setTimeout(() => setCopiedId(null), 2000);
      setContextMenu(null);
    },
    [copyUrl]
  );

  const handleDownload = useCallback(async (assetId: string) => {
    const blob = await useMediaStore.getState().bulkDownload([assetId]);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'download';
      a.click();
      URL.revokeObjectURL(url);
    }
    setContextMenu(null);
  }, []);

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No media found
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {assets.map((asset, index) => {
          const isImage = asset.mimeType.startsWith('image/');
          const isVideo = asset.mimeType.startsWith('video/');
          const isSelected = selectedIds.includes(asset.id);
          const isLoaded = loadedImages.has(asset.id);

          return (
            <div
              key={asset.id}
              onClick={(e) => handleClick(asset, index, e)}
              onDoubleClick={() => handleDoubleClick(asset)}
              onContextMenu={(e) => handleContextMenu(e, asset.id)}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary ring-offset-1'
              )}
            >
              <div className="aspect-[4/3] bg-muted">
                {isImage ? (
                  <>
                    {!isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-5 animate-pulse rounded bg-muted-foreground/10" />
                      </div>
                    )}
                    <img
                      src={
                        asset.thumbnailUrl ?? asset.url ?? '/placeholder.svg'
                      }
                      alt={asset.alt ?? asset.filename}
                      className={cn(
                        'h-full w-full object-cover transition-opacity',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      loading="lazy"
                      onLoad={() =>
                        setLoadedImages((prev) => new Set(prev).add(asset.id))
                      }
                    />
                  </>
                ) : isVideo ? (
                  <div className="flex h-full items-center justify-center">
                    <Video className="size-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                <p className="truncate text-[11px] font-medium text-white">
                  {asset.filename}
                </p>
                <p className="text-[9px] text-white/70">
                  {formatFileSize(asset.size)}
                  {asset.width &&
                    ` · ${formatDimensions(asset.width, asset.height)}`}
                </p>
              </div>

              <div className="absolute left-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(asset.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="size-3.5 rounded border-white/50"
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(asset.id);
                }}
                className={cn(
                  'absolute right-1.5 top-1.5 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100',
                  asset.isFavorited && 'opacity-100'
                )}
              >
                <Star
                  className={cn(
                    'size-3',
                    asset.isFavorited
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-white/70'
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>

      {contextMenu && (
        <div
          ref={contextRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed z-50 w-44 rounded-lg border bg-card py-1 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCopyUrl(contextMenu.assetId, 'direct')}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
          >
            {copiedId === contextMenu.assetId ? (
              <Check className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
            Copy URL
          </button>
          <button
            onClick={() => handleCopyUrl(contextMenu.assetId, 'markdown')}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
          >
            <Copy className="size-3" />
            Copy Markdown
          </button>
          <button
            onClick={() => handleCopyUrl(contextMenu.assetId, 'html')}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
          >
            <Copy className="size-3" />
            Copy HTML
          </button>
          <div className="my-1 border-t" />
          <button
            onClick={() => handleDownload(contextMenu.assetId)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
          >
            <Download className="size-3" />
            Download
          </button>
          <button
            onClick={() => {
              setCurrentAsset(contextMenu.assetId);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
          >
            <Pencil className="size-3" />
            Edit
          </button>
          <div className="my-1 border-t" />
          <button
            onClick={() => {
              deleteAsset(contextMenu.assetId);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3" />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
