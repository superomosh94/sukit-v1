'use client';

import { useState, useCallback } from 'react';
import {
  Image,
  X,
  Copy,
  Check,
  Trash2,
  Star,
  ExternalLink,
  RotateCw,
  Crop,
  Hash,
  MapPin,
  Camera,
  Sliders,
  FileCode,
  FolderOpen,
  Link,
  ChevronRight,
  Info,
  Video,
  FileText,
  FileSpreadsheet,
  File,
  Clock,
  Gauge,
  Code,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import {
  formatFileSize,
  formatDimensions,
  isVideoType,
  isDocumentType,
} from '../utils/fileUtils';
import { VideoPlayer } from './VideoPlayer';
import { PdfViewer } from './PdfViewer';
import { ExifPanel } from './ExifPanel';
import { UrlPanel } from './UrlPanel';
import { EmbedPanel } from './EmbedPanel';
import type { VariantType } from '../types';

type DetailsTab = 'info' | 'exif' | 'urls' | 'embed' | 'optimize';

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface EditableFieldProps {
  label: string;
  value: string | undefined | null;
  placeholder?: string;
  multiline?: boolean;
  onSave: (value: string) => void;
}

function EditableField({
  label,
  value,
  placeholder,
  multiline,
  onSave,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');

  const handleSave = () => {
    onSave(editValue);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-1">
        <label className="text-[10px] font-medium uppercase text-muted-foreground">
          {label}
        </label>
        <div className="flex gap-1">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) =>
                setEditValue(
                  (e.target as HTMLInputElement | HTMLTextAreaElement).value
                )
              }
              className="h-16 w-full rounded border px-2 py-1 text-xs resize-none outline-none"
              autoFocus
            />
          ) : (
            <input
              value={editValue}
              onChange={(e) =>
                setEditValue(
                  (e.target as HTMLInputElement | HTMLTextAreaElement).value
                )
              }
              className="h-7 flex-1 rounded border px-2 text-xs outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          )}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={handleSave}
              className="rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-[10px] text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <label className="text-[10px] font-medium uppercase text-muted-foreground">
        {label}
      </label>
      <p
        onClick={() => {
          setEditValue(value ?? '');
          setEditing(true);
        }}
        className="cursor-pointer rounded border border-transparent px-2 py-1 text-xs hover:border-input"
      >
        {value || (
          <span className="italic text-muted-foreground">
            {placeholder ?? 'Click to add'}
          </span>
        )}
      </p>
    </div>
  );
}

export function MediaDetails() {
  const currentAsset = useMediaStore((s) => s.currentAsset);
  const updateAsset = useMediaStore((s) => s.updateAsset);
  const deleteAsset = useMediaStore((s) => s.deleteAsset);
  const toggleFavorite = useMediaStore((s) => s.toggleFavorite);
  const copyUrl = useMediaStore((s) => s.copyUrl);
  const getUrl = useMediaStore((s) => s.getUrl);
  const getSrcSet = useMediaStore((s) => s.getSrcSet);
  const setCurrentAsset = useMediaStore((s) => s.setCurrentAsset);

  const [activeTab, setActiveTab] = useState<DetailsTab>('info');
  const [copied, setCopied] = useState<
    'direct' | 'markdown' | 'html' | 'thumbnail' | 'srcset' | null
  >(null);
  const [showVariants, setShowVariants] = useState(false);

  const handleCopy = (
    format: 'direct' | 'markdown' | 'html' | 'thumbnail' | 'srcset'
  ) => {
    if (!currentAsset) return;
    let text = '';
    switch (format) {
      case 'direct':
        text = copyUrl(currentAsset.id, 'direct');
        break;
      case 'markdown':
        text = copyUrl(currentAsset.id, 'markdown');
        break;
      case 'html':
        text = copyUrl(currentAsset.id, 'html');
        break;
      case 'thumbnail':
        text = getUrl(currentAsset.id, 'thumbnail');
        break;
      case 'srcset':
        text = getSrcSet(currentAsset.id);
        break;
    }
    (navigator as any).clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFieldSave = useCallback(
    (field: string) => (value: string) => {
      if (currentAsset) {
        updateAsset(currentAsset.id, { [field]: value } as any);
      }
    },
    [currentAsset, updateAsset]
  );

  if (!currentAsset) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Image className="mx-auto mb-2 size-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Select media to view details
          </p>
        </div>
      </div>
    );
  }

  const isImage = currentAsset.mimeType.startsWith('image/');
  const isVideo = isVideoType(currentAsset.mimeType);
  const isDocument = isDocumentType(currentAsset.mimeType);
  const isPdf = currentAsset.mimeType === 'application/pdf';

  const documentIcon = (() => {
    const t = currentAsset.mimeType;
    if (isPdf) return FileText;
    if (t.includes('word') || t.includes('document')) return FileText;
    if (t.includes('excel') || t.includes('sheet')) return FileSpreadsheet;
    if (t.includes('presentation') || t.includes('powerpoint')) return File;
    return File;
  })();
  const DocumentIcon = documentIcon;

  const documentBadgeColor = (() => {
    const t = currentAsset.mimeType;
    if (isPdf) return 'border-red-300 bg-red-50 text-red-700';
    if (t.includes('word') || t.includes('document'))
      return 'border-blue-300 bg-blue-50 text-blue-700';
    if (t.includes('excel') || t.includes('sheet'))
      return 'border-green-300 bg-green-50 text-green-700';
    if (t.includes('presentation') || t.includes('powerpoint'))
      return 'border-orange-300 bg-orange-50 text-orange-700';
    return 'border-gray-300 bg-gray-50 text-gray-700';
  })();

  const variantLabels: Record<VariantType, string> = {
    original: 'Original',
    webp: 'WebP',
    avif: 'AVIF',
    thumbnail: 'Thumbnail',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    xl: 'XL',
  };

  const exifData = currentAsset.metadata as Record<string, any> | undefined;

  const tabs: { key: DetailsTab; label: string; icon: typeof Info }[] = [
    { key: 'info', label: 'Info', icon: Info },
    { key: 'exif', label: 'EXIF', icon: Camera },
    { key: 'urls', label: 'URLs', icon: Link },
    { key: 'embed', label: 'Embed', icon: Code },
    { key: 'optimize', label: 'Optimize', icon: Gauge },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Preview */}
      <div className="flex items-center justify-center border-b bg-muted/20 p-4">
        {isImage ? (
          <img
            src={
              currentAsset.url ??
              currentAsset.thumbnailUrl ??
              '/placeholder.svg'
            }
            alt={currentAsset.alt ?? currentAsset.filename}
            className="max-h-48 max-w-full rounded object-contain"
          />
        ) : isVideo && currentAsset.url ? (
          <div className="w-full max-w-lg">
            <VideoPlayer
              src={currentAsset.url}
              poster={currentAsset.thumbnailUrl}
              duration={currentAsset.duration}
              width={currentAsset.width}
              height={currentAsset.height}
              codec={(currentAsset.metadata as any)?.codec}
              onThumbnailSelect={(time) => {
                currentAsset.metadata = {
                  ...currentAsset.metadata,
                  thumbnailTime: time,
                } as any;
              }}
            />
          </div>
        ) : isPdf && currentAsset.url ? (
          <div className="w-full max-w-lg">
            <PdfViewer
              src={currentAsset.url}
              pageCount={
                (currentAsset.metadata as any)?.pageCount as number | undefined
              }
              filename={currentAsset.filename}
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded bg-muted">
            {isVideo ? (
              <Video className="size-10 text-muted-foreground/40" />
            ) : (
              <FileText className="size-10 text-muted-foreground/40" />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => toggleFavorite(currentAsset.id)}
            className={cn(
              'rounded p-1.5 hover:bg-accent',
              currentAsset.isFavorited && 'text-amber-500'
            )}
          >
            <Star
              className={cn(
                'size-3.5',
                currentAsset.isFavorited && 'fill-current'
              )}
            />
          </button>
          <button
            onClick={() => deleteAsset(currentAsset.id)}
            className="rounded p-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
          {currentAsset.url && (
            <a
              href={currentAsset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
        <button
          onClick={() => setCurrentAsset(null)}
          className="rounded p-1.5 hover:bg-accent"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4 p-4">
            {/* Filename */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-muted-foreground">
                Filename
              </label>
              <p className="break-all rounded border px-2 py-1 text-xs font-medium">
                {currentAsset.filename}
              </p>
            </div>

            {/* File type badge */}
            {(isVideo || isDocument) && (
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium',
                    isVideo && 'border-purple-300 bg-purple-50 text-purple-700',
                    isDocument && documentBadgeColor
                  )}
                >
                  {isVideo ? (
                    <Video className="size-3" />
                  ) : (
                    <DocumentIcon className="size-3" />
                  )}
                  {isVideo
                    ? 'Video'
                    : isPdf
                      ? 'PDF'
                      : currentAsset.mimeType.includes('word') ||
                          currentAsset.mimeType.includes('document')
                        ? 'Word'
                        : currentAsset.mimeType.includes('excel') ||
                            currentAsset.mimeType.includes('sheet')
                          ? 'Excel'
                          : 'Document'}
                </span>
                {isVideo && currentAsset.duration != null && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                    <Clock className="size-3" />
                    {formatDuration(currentAsset.duration)}
                  </span>
                )}
                {isPdf && (currentAsset.metadata as any)?.pageCount != null && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                    <FileText className="size-3" />
                    {(currentAsset.metadata as any).pageCount} page
                    {(currentAsset.metadata as any).pageCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            {/* File info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium uppercase text-muted-foreground">
                  Size
                </label>
                <p className="text-xs">{formatFileSize(currentAsset.size)}</p>
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase text-muted-foreground">
                  Type
                </label>
                <p className="text-xs">{currentAsset.mimeType}</p>
              </div>
              {currentAsset.width && (
                <div>
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">
                    Dimensions
                  </label>
                  <p className="text-xs">
                    {formatDimensions(currentAsset.width, currentAsset.height)}
                  </p>
                </div>
              )}
              {isVideo && currentAsset.duration != null && (
                <div>
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">
                    Duration
                  </label>
                  <p className="text-xs">
                    {formatDuration(currentAsset.duration)}
                  </p>
                </div>
              )}
              {isPdf && (currentAsset.metadata as any)?.pageCount != null && (
                <div>
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">
                    Pages
                  </label>
                  <p className="text-xs">
                    {(currentAsset.metadata as any).pageCount}
                  </p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-medium uppercase text-muted-foreground">
                  Uploaded
                </label>
                <p className="text-xs">
                  {new Date(currentAsset.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Folder path */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-muted-foreground">
                Location
              </label>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <FolderOpen className="size-3" />
                {currentAsset.folderId
                  ? `Folder ID: ${currentAsset.folderId}`
                  : 'Root folder'}
              </p>
            </div>

            {/* Hash */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-muted-foreground">
                File hash
              </label>
              <p className="truncate rounded bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
                {currentAsset.id}
              </p>
            </div>

            {/* Editable fields */}
            <EditableField
              label="Alt Text"
              value={currentAsset.alt}
              placeholder="No alt text — click to add"
              onSave={handleFieldSave('alt')}
            />

            <EditableField
              label="Caption"
              value={currentAsset.caption}
              placeholder="Optional caption"
              onSave={handleFieldSave('caption')}
            />

            <EditableField
              label="Description"
              value={currentAsset.description}
              placeholder="Optional description"
              multiline
              onSave={handleFieldSave('description')}
            />

            <EditableField
              label="Title"
              value={(currentAsset.metadata as any)?.title ?? ''}
              placeholder="Optional title"
              onSave={(v) =>
                updateAsset(currentAsset.id, {
                  metadata: { ...currentAsset.metadata, title: v },
                } as any)
              }
            />

            <EditableField
              label="Copyright"
              value={currentAsset.copyright}
              placeholder="Copyright info"
              onSave={handleFieldSave('copyright')}
            />

            <EditableField
              label="Credit"
              value={currentAsset.credit}
              placeholder="Credit attribution"
              onSave={handleFieldSave('credit')}
            />

            <EditableField
              label="Source URL"
              value={(currentAsset.metadata as any)?.sourceUrl ?? ''}
              placeholder="Source URL"
              onSave={(v) =>
                updateAsset(currentAsset.id, {
                  metadata: { ...currentAsset.metadata, sourceUrl: v },
                } as any)
              }
            />

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-muted-foreground">
                Tags
              </label>
              <div className="flex flex-wrap gap-1">
                {currentAsset.tags.length > 0 ? (
                  currentAsset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-muted-foreground">
                    No tags
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {currentAsset.variants && currentAsset.variants.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowVariants(!showVariants)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="size-3.5" />
                    Variants ({currentAsset.variants.length})
                  </span>
                  <ChevronRight
                    className={cn(
                      'size-3.5 transition-transform',
                      showVariants && 'rotate-90'
                    )}
                  />
                </button>
                {showVariants && (
                  <div className="space-y-1 pl-1">
                    {currentAsset.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded border px-2 py-1 text-[10px]"
                      >
                        <span className="font-medium capitalize">
                          {variantLabels[v.type] ?? v.type}
                        </span>
                        <span className="text-muted-foreground">
                          {v.width}×{v.height} · {formatFileSize(v.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video codec info */}
            {isVideo && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowVariants(!showVariants)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <Video className="size-3.5" />
                    Video Info
                  </span>
                  <ChevronRight
                    className={cn(
                      'size-3.5 transition-transform',
                      showVariants && 'rotate-90'
                    )}
                  />
                </button>
                {showVariants && (
                  <div className="grid grid-cols-2 gap-2 pl-1 text-[10px]">
                    {(currentAsset.metadata as any)?.codec && (
                      <>
                        <span className="text-muted-foreground">Codec</span>
                        <span>{(currentAsset.metadata as any).codec}</span>
                      </>
                    )}
                    {currentAsset.duration != null && (
                      <>
                        <span className="text-muted-foreground">Duration</span>
                        <span>{formatDuration(currentAsset.duration)}</span>
                      </>
                    )}
                    {currentAsset.width && currentAsset.height && (
                      <>
                        <span className="text-muted-foreground">
                          Resolution
                        </span>
                        <span>
                          {currentAsset.width} × {currentAsset.height}
                        </span>
                      </>
                    )}
                    {(currentAsset.metadata as any)?.frameRate && (
                      <>
                        <span className="text-muted-foreground">
                          Frame Rate
                        </span>
                        <span>
                          {(currentAsset.metadata as any).frameRate} fps
                        </span>
                      </>
                    )}
                    {(currentAsset.metadata as any)?.bitrate && (
                      <>
                        <span className="text-muted-foreground">Bitrate</span>
                        <span>{(currentAsset.metadata as any).bitrate}</span>
                      </>
                    )}
                    {!(currentAsset.metadata as any)?.codec &&
                      !(currentAsset.metadata as any)?.frameRate &&
                      !(currentAsset.metadata as any)?.bitrate && (
                        <p className="col-span-2 italic text-muted-foreground">
                          No video metadata available
                        </p>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Usage count */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-muted-foreground">
                Usage
              </label>
              <p className="text-xs text-muted-foreground">
                Referenced in {currentAsset.tags.length} location
                {currentAsset.tags.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'exif' && (
          <div className="p-4">
            <ExifPanel metadata={currentAsset.metadata ?? null} />
          </div>
        )}

        {activeTab === 'urls' && (
          <div className="p-4">
            <UrlPanel asset={currentAsset} />
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="p-4">
            <EmbedPanel asset={currentAsset} />
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Gauge className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Optimization
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Compress, convert, and generate responsive variants for this
              asset. Coming soon.
            </p>
            <button
              onClick={() =>
                useMediaStore.getState().generateVariants(currentAsset.id)
              }
              className="mt-4 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Generate variants now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
