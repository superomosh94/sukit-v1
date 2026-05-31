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
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import { formatFileSize, formatDimensions } from '../utils/fileUtils';
import type { VariantType } from '../types';

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
              onChange={(e) => setEditValue(e.target.value)}
              className="h-16 w-full rounded border px-2 py-1 text-xs resize-none outline-none"
              autoFocus
            />
          ) : (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
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

  const [copied, setCopied] = useState<
    'direct' | 'markdown' | 'html' | 'thumbnail' | 'srcset' | null
  >(null);
  const [showExif, setShowExif] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showUrls, setShowUrls] = useState(false);

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
    navigator.clipboard.writeText(text);
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
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded bg-muted">
            <Image className="size-10 text-muted-foreground/40" />
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

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
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

          {/* URL copy options */}
          <div className="space-y-2">
            <button
              onClick={() => setShowUrls(!showUrls)}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <Link className="size-3.5" />
                URLs
              </span>
              <ChevronRight
                className={cn(
                  'size-3.5 transition-transform',
                  showUrls && 'rotate-90'
                )}
              />
            </button>
            {showUrls && (
              <div className="space-y-1 pl-1">
                {(
                  ['direct', 'markdown', 'html', 'thumbnail', 'srcset'] as const
                ).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleCopy(format)}
                    className="flex w-full items-center gap-2 rounded border px-2 py-1.5 text-xs hover:bg-accent"
                  >
                    {copied === format ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span className="flex-1 text-left capitalize">
                      {format}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {copied === format ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

          {/* EXIF data */}
          {isImage && (
            <div className="space-y-2">
              <button
                onClick={() => setShowExif(!showExif)}
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <Camera className="size-3.5" />
                  EXIF Data
                </span>
                <ChevronRight
                  className={cn(
                    'size-3.5 transition-transform',
                    showExif && 'rotate-90'
                  )}
                />
              </button>
              {showExif && (
                <div className="space-y-2 pl-1">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {exifData?.make && (
                      <>
                        <span className="text-muted-foreground">
                          Camera Make
                        </span>
                        <span>{exifData.make}</span>
                      </>
                    )}
                    {exifData?.model && (
                      <>
                        <span className="text-muted-foreground">
                          Camera Model
                        </span>
                        <span>{exifData.model}</span>
                      </>
                    )}
                    {exifData?.lens && (
                      <>
                        <span className="text-muted-foreground">Lens</span>
                        <span>{exifData.lens}</span>
                      </>
                    )}
                    {exifData?.focalLength && (
                      <>
                        <span className="text-muted-foreground">
                          Focal Length
                        </span>
                        <span>{exifData.focalLength}mm</span>
                      </>
                    )}
                    {exifData?.aperture && (
                      <>
                        <span className="text-muted-foreground">Aperture</span>
                        <span>f/{exifData.aperture}</span>
                      </>
                    )}
                    {exifData?.iso && (
                      <>
                        <span className="text-muted-foreground">ISO</span>
                        <span>{exifData.iso}</span>
                      </>
                    )}
                    {exifData?.shutterSpeed && (
                      <>
                        <span className="text-muted-foreground">
                          Shutter Speed
                        </span>
                        <span>{exifData.shutterSpeed}s</span>
                      </>
                    )}
                    {exifData?.gpsLat && exifData?.gpsLng && (
                      <>
                        <span className="text-muted-foreground">GPS</span>
                        <span className="truncate">
                          {exifData.gpsLat.toFixed(4)},{' '}
                          {exifData.gpsLng.toFixed(4)}
                        </span>
                      </>
                    )}
                  </div>
                  {!exifData?.make && !exifData?.model && (
                    <p className="text-[10px] text-muted-foreground italic">
                      No EXIF data available
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
      </div>
    </div>
  );
}
