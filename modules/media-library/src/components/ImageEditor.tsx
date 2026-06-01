'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  Undo2,
  Check,
  Sliders,
  Crop,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';
import type { CropArea, ImageFilter } from '../types';

interface ImageEditorProps {
  assetId: string;
  onClose: () => void;
}

type EditorTab = 'crop' | 'resize' | 'rotate' | 'filters';

const ASPECT_RATIOS = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: 'Instagram', value: 1 },
  { label: 'Twitter', value: 16 / 9 },
  { label: 'Facebook', value: 1.91 },
];

const PRESET_FILTERS = [
  { name: 'Original', class: '' },
  { name: 'Vintage', class: 'sepia-[0.3] contrast-[0.85] brightness-[1.1]' },
  {
    name: 'Cool',
    class: 'hue-rotate-[200deg] saturate-[1.2] brightness-[0.95]',
  },
  { name: 'Warm', class: 'sepia-[0.15] saturate-[1.3] brightness-[1.05]' },
  {
    name: 'Dramatic',
    class: 'contrast-[1.4] brightness-[0.85] saturate-[0.8]',
  },
  { name: 'Grayscale', class: 'grayscale' },
];

const RESIZE_PRESETS = [
  { label: 'Small', width: 320, height: 240 },
  { label: 'Medium', width: 640, height: 480 },
  { label: 'Large', width: 1024, height: 768 },
  { label: 'XL', width: 1920, height: 1080 },
  { label: 'OG', width: 1200, height: 630 },
  { label: 'Thumbnail', width: 150, height: 150 },
];

export function ImageEditor({ assetId, onClose }: ImageEditorProps) {
  const {
    assets,
    cropAsset,
    resizeAsset,
    rotateAsset,
    flipAsset,
    applyFilter,
  } = useMediaStore();

  const asset = assets.find((a) => a.id === assetId);
  const [activeTab, setActiveTab] = useState<EditorTab>('crop');

  // Crop state
  const [aspectRatio, setAspectRatio] = useState<string | number>('free');
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isCropping, setIsCropping] = useState(false);

  // Resize state
  const [resizeWidth, setResizeWidth] = useState(asset?.width ?? 800);
  const [resizeHeight, setResizeHeight] = useState(asset?.height ?? 600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizeMode, setResizeMode] = useState<'pixel' | 'percent'>('pixel');

  // Rotate state
  const [rotation, setRotation] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<ImageFilter>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [sharpness, setSharpness] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string>('Original');
  const [saving, setSaving] = useState(false);

  const aspectRatioRef = useRef(aspectRatio);
  aspectRatioRef.current = aspectRatio;

  useEffect(() => {
    if (asset) {
      setResizeWidth(asset.width ?? 800);
      setResizeHeight(asset.height ?? 600);
    }
  }, [asset]);

  const handleCrop = useCallback(async () => {
    setSaving(true);
    await cropAsset(assetId, cropArea);
    setSaving(false);
    onClose();
  }, [assetId, cropArea, cropAsset, onClose]);

  const handleResize = useCallback(async () => {
    setSaving(true);
    await resizeAsset(assetId, resizeWidth, resizeHeight);
    setSaving(false);
    onClose();
  }, [assetId, resizeWidth, resizeHeight, resizeAsset, onClose]);

  const handleRotate = useCallback(
    async (degrees: 90 | 180 | 270) => {
      setSaving(true);
      await rotateAsset(assetId, degrees);
      setSaving(false);
    },
    [assetId, rotateAsset]
  );

  const handleFlip = useCallback(
    async (direction: 'horizontal' | 'vertical') => {
      setSaving(true);
      await flipAsset(assetId, direction);
      setSaving(false);
    },
    [assetId, flipAsset]
  );

  const handleApplyFilter = useCallback(async () => {
    setSaving(true);
    await applyFilter(assetId, {
      brightness: filters?.brightness ?? 0 / 100,
      contrast: filters?.contrast ?? 0 / 100,
      saturation: filters?.saturation ?? 0 / 100,
      blur: filters.blur,
    });
    setSaving(false);
    onClose();
  }, [assetId, filters, applyFilter, onClose]);

  const handlePresetFilter = useCallback((name: string) => {
    setSelectedPreset(name);
    switch (name) {
      case 'Original':
        setFilters({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
        });
        setSharpness(0);
        break;
      case 'Vintage':
        setFilters({ brightness: 110, contrast: 85, saturation: 80, blur: 0 });
        setSharpness(0);
        break;
      case 'Cool':
        setFilters({ brightness: 95, contrast: 100, saturation: 120, blur: 0 });
        setSharpness(0);
        break;
      case 'Warm':
        setFilters({
          brightness: 105,
          contrast: 100,
          saturation: 130,
          blur: 0,
        });
        setSharpness(0);
        break;
      case 'Dramatic':
        setFilters({ brightness: 85, contrast: 140, saturation: 80, blur: 0 });
        setSharpness(0);
        break;
      case 'Grayscale':
        setFilters({ brightness: 100, contrast: 100, saturation: 0, blur: 0 });
        setSharpness(0);
        break;
    }
  }, []);

  const handleResizeWidthChange = useCallback(
    (w: number) => {
      setResizeWidth(w);
      if (maintainAspect && asset?.width && asset?.height) {
        const ratio = asset.height / asset.width;
        setResizeHeight(Math.round(w * ratio));
      }
    },
    [maintainAspect, asset]
  );

  const handleResizeHeightChange = useCallback(
    (h: number) => {
      setResizeHeight(h);
      if (maintainAspect && asset?.width && asset?.height) {
        const ratio = asset.width / asset.height;
        setResizeWidth(Math.round(h * ratio));
      }
    },
    [maintainAspect, asset]
  );

  if (!asset) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="rounded-lg border bg-card p-8 shadow-xl">
          <p className="text-sm text-muted-foreground">Asset not found</p>
        </div>
      </div>
    );
  }

  const filterStyle: React.CSSProperties = {
    filter: [
      `brightness(${filters?.brightness ?? 0}%)`,
      `contrast(${filters?.contrast ?? 0}%)`,
      `saturate(${filters?.saturation ?? 0}%)`,
      `blur(${filters.blur}px)`,
      sharpness > 0 ? `contrast(${100 + sharpness * 2}%)` : '',
    ]
      .filter(Boolean)
      .join(' '),
    transform: `rotate(${rotation}deg)`,
  };

  const tabs: { key: EditorTab; label: string; icon: typeof Crop }[] = [
    { key: 'crop', label: 'Crop', icon: Crop },
    { key: 'resize', label: 'Resize', icon: Maximize2 },
    { key: 'rotate', label: 'Rotate', icon: RotateCw },
    { key: 'filters', label: 'Filters', icon: Sliders },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[85vh] w-[90vw] max-w-6xl flex-col rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <h2 className="text-base font-semibold">Image Editor</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  blur: 0,
                });
                setSharpness(0);
                setRotation(0);
                setSelectedPreset('Original');
              }}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
            >
              <RefreshCw className="size-3" />
              Reset
            </button>
            <button onClick={onClose} className="rounded p-1 hover:bg-accent">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="w-48 shrink-0 border-r p-2 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  activeTab === t.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}

            <div className="my-2 border-t" />

            <div className="space-y-2 px-1">
              {activeTab === 'crop' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">
                      Aspect Ratio
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {ASPECT_RATIOS.map((ar) => (
                        <button
                          key={ar.label}
                          onClick={() => setAspectRatio(ar.value)}
                          className={cn(
                            'rounded border px-2 py-1 text-[10px] transition-colors',
                            aspectRatio === ar.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'hover:bg-accent'
                          )}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCrop}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? 'Applying...' : 'Apply Crop'}
                  </button>
                </div>
              )}

              {activeTab === 'resize' && (
                <div className="space-y-3">
                  <div className="flex gap-1 rounded-md border text-[11px]">
                    {(['pixel', 'percent'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setResizeMode(mode)}
                        className={cn(
                          'flex-1 px-2 py-1 capitalize',
                          resizeMode === mode
                            ? 'bg-accent font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Width
                      </label>
                      <input
                        type="number"
                        value={
                          resizeMode === 'percent'
                            ? Math.round(
                                (resizeWidth / (asset.width ?? 1)) * 100
                              )
                            : resizeWidth
                        }
                        onChange={(e) => {
                          const val = Number(
                            (e.target as HTMLInputElement).value
                          );
                          if (resizeMode === 'percent') {
                            const w = Math.round(
                              (val / 100) * (asset.width ?? 1)
                            );
                            handleResizeWidthChange(w);
                          } else {
                            handleResizeWidthChange(val);
                          }
                        }}
                        className="h-7 w-full rounded border px-2 text-xs tabular-nums outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Height
                      </label>
                      <input
                        type="number"
                        value={
                          resizeMode === 'percent'
                            ? Math.round(
                                (resizeHeight / (asset.height ?? 1)) * 100
                              )
                            : resizeHeight
                        }
                        onChange={(e) => {
                          const val = Number(
                            (e.target as HTMLInputElement).value
                          );
                          if (resizeMode === 'percent') {
                            const h = Math.round(
                              (val / 100) * (asset.height ?? 1)
                            );
                            handleResizeHeightChange(h);
                          } else {
                            handleResizeHeightChange(val);
                          }
                        }}
                        className="h-7 w-full rounded border px-2 text-xs tabular-nums outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={maintainAspect}
                      onChange={() => setMaintainAspect(!maintainAspect)}
                      className="size-3"
                    />
                    Maintain aspect ratio
                  </label>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">
                      Presets
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {RESIZE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            setResizeWidth(preset.width);
                            setResizeHeight(preset.height);
                          }}
                          className={cn(
                            'rounded border px-2 py-1 text-[10px] transition-colors hover:bg-accent',
                            resizeWidth === preset.width &&
                              resizeHeight === preset.height
                              ? 'border-primary bg-primary/10 text-primary'
                              : ''
                          )}
                        >
                          {preset.label} ({preset.width}×{preset.height})
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleResize}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? 'Applying...' : 'Apply Resize'}
                  </button>
                </div>
              )}

              {activeTab === 'rotate' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleRotate(90)}
                      className="flex flex-col items-center gap-1 rounded border p-3 text-xs hover:bg-accent"
                    >
                      <RotateCw className="size-5" />
                      90° CW
                    </button>
                    <button
                      onClick={() => handleRotate(270)}
                      className="flex flex-col items-center gap-1 rounded border p-3 text-xs hover:bg-accent"
                    >
                      <RotateCcw className="size-5" />
                      90° CCW
                    </button>
                    <button
                      onClick={() => handleRotate(180)}
                      className="flex flex-col items-center gap-1 rounded border p-3 text-xs hover:bg-accent"
                    >
                      <RotateCw className="size-5" />
                      180°
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 45) % 360)}
                      className="flex flex-col items-center gap-1 rounded border p-3 text-xs hover:bg-accent"
                    >
                      <RotateCw className="size-5" />
                      Custom
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">
                      Custom angle: {rotation}°
                    </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotation}
                      onChange={(e) =>
                        setRotation(
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      className="mt-1 w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleFlip('horizontal')}
                      className="flex items-center justify-center gap-1.5 rounded border p-2 text-xs hover:bg-accent"
                    >
                      <FlipHorizontal className="size-4" />
                      Flip H
                    </button>
                    <button
                      onClick={() => handleFlip('vertical')}
                      className="flex items-center justify-center gap-1.5 rounded border p-2 text-xs hover:bg-accent"
                    >
                      <FlipVertical className="size-4" />
                      Flip V
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-1">
                    {PRESET_FILTERS.map((pf) => (
                      <button
                        key={pf.name}
                        onClick={() => handlePresetFilter(pf.name)}
                        className={cn(
                          'rounded border px-2 py-1 text-[10px] transition-colors',
                          selectedPreset === pf.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:bg-accent'
                        )}
                      >
                        {pf.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Brightness: {filters?.brightness ?? 0}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={filters?.brightness ?? 0}
                        onChange={(e) => {
                          setSelectedPreset('');
                          setFilters((f) => ({
                            ...f,
                            brightness: Number(
                              (e.target as HTMLInputElement).value
                            ),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Contrast: {filters?.contrast ?? 0}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={filters?.contrast ?? 0}
                        onChange={(e) => {
                          setSelectedPreset('');
                          setFilters((f) => ({
                            ...f,
                            contrast: Number(
                              (e.target as HTMLInputElement).value
                            ),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Saturation: {filters?.saturation ?? 0}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={filters?.saturation ?? 0}
                        onChange={(e) => {
                          setSelectedPreset('');
                          setFilters((f) => ({
                            ...f,
                            saturation: Number(
                              (e.target as HTMLInputElement).value
                            ),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Blur: {filters.blur}px
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={filters.blur}
                        onChange={(e) => {
                          setSelectedPreset('');
                          setFilters((f) => ({
                            ...f,
                            blur: Number((e.target as HTMLInputElement).value),
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Sharpness: {sharpness}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={sharpness}
                        onChange={(e) => {
                          setSelectedPreset('');
                          setSharpness(
                            Number((e.target as HTMLInputElement).value)
                          );
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleApplyFilter}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? 'Applying...' : 'Apply Filters'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-1 items-center justify-center bg-muted/30 p-8">
            <div className="overflow-hidden rounded-lg shadow-lg max-h-full max-w-full">
              <img
                src={asset.url ?? asset.thumbnailUrl ?? '/placeholder.svg'}
                alt={asset.filename}
                style={filterStyle}
                className="max-h-[65vh] max-w-full object-contain transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (activeTab === 'crop') handleCrop();
              else if (activeTab === 'resize') handleResize();
              else if (activeTab === 'filters') handleApplyFilter();
            }}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            <Check className="size-3.5" />
            {saving ? 'Saving...' : 'Apply & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
