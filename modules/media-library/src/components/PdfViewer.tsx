'use client';

import { useState, useCallback } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface PdfViewerProps {
  src: string;
  pageCount?: number;
  filename: string;
}

type ZoomMode = 'fitpage' | 'fitwidth' | number;

export function PdfViewer({ src, pageCount, filename }: PdfViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fitpage');

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const zoomIn = useCallback(() => {
    setZoomMode((prev) => {
      if (typeof prev === 'string') return 1;
      const idx = zoomLevels.indexOf(prev);
      if (idx < zoomLevels.length - 1) return zoomLevels[idx + 1];
      return prev;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomMode((prev) => {
      if (typeof prev === 'string') return 1;
      const idx = zoomLevels.indexOf(prev);
      if (idx > 0) return zoomLevels[idx - 1];
      return prev;
    });
  }, []);

  const cycleZoomMode = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === 'fitpage') return 'fitwidth' as ZoomMode;
      if (prev === 'fitwidth') return 1;
      return 'fitpage' as ZoomMode;
    });
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleIframeError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const zoomPercent =
    typeof zoomMode === 'number'
      ? `${Math.round(zoomMode * 100)}%`
      : zoomMode === 'fitpage'
        ? 'Fit page'
        : 'Fit width';

  const viewerUrl = `${src}#view=${zoomMode === 'fitpage' ? 'FitH' : zoomMode === 'fitwidth' ? 'FitW' : `zoom=${zoomMode}`}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
        <div className="flex items-center gap-1">
          {/* Zoom out */}
          <button
            onClick={zoomOut}
            disabled={typeof zoomMode === 'string' || zoomMode <= zoomLevels[0]}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="size-3.5" />
          </button>

          {/* Zoom mode toggle */}
          <button
            onClick={cycleZoomMode}
            className="min-w-[56px] rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Toggle zoom mode"
          >
            {zoomPercent}
          </button>

          {/* Zoom in */}
          <button
            onClick={zoomIn}
            disabled={
              typeof zoomMode === 'string' ||
              zoomMode >= zoomLevels[zoomLevels.length - 1]
            }
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="size-3.5" />
          </button>
        </div>

        {/* Page count */}
        {pageCount != null && (
          <span className="text-[10px] text-muted-foreground">
            {pageCount} page{pageCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Download */}
        <a
          href={src}
          download={filename}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Download original"
        >
          <Download className="size-3" />
          Download
        </a>
      </div>

      {/* Viewer area */}
      <div className="relative flex-1 bg-muted/10">
        {/* Loading spinner */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* PDF not supported fallback */}
        {hasError && (
          <div className="flex h-48 flex-col items-center justify-center gap-3 p-6">
            <AlertTriangle className="size-8 text-amber-500" />
            <p className="text-center text-xs text-muted-foreground">
              Your browser does not support embedded PDF viewing.
            </p>
            <a
              href={src}
              download={filename}
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-3.5" />
              Download {filename}
            </a>
          </div>
        )}

        {/* PDF iframe */}
        {!hasError && (
          <iframe
            src={viewerUrl}
            className={cn('h-64 w-full border-0', !isLoaded && 'invisible')}
            title={filename}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
