'use client';

import { useState, useCallback } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Image, FolderUp, Video, FileText, X, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    url: '/placeholder.svg',
    filename: 'hero-bg.jpg',
    mimeType: 'image/jpeg',
    size: 245000,
    width: 1920,
    height: 1080,
  },
  {
    id: '2',
    url: '/placeholder.svg',
    filename: 'logo.svg',
    mimeType: 'image/svg+xml',
    size: 4200,
    width: 200,
    height: 60,
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    filename: 'mountain.jpg',
    mimeType: 'image/jpeg',
    size: 890000,
    width: 1920,
    height: 1280,
  },
];

interface MediaBrowserProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
}

export function MediaBrowser({
  value,
  onChange,
  accept = 'image/*',
  placeholder = 'Select media...',
}: MediaBrowserProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = media.filter((item) => {
    const matchesSearch = item.filename
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = !filterType || item.mimeType.startsWith(filterType);
    return matchesSearch && matchesType;
  });

  const handleSelect = useCallback(
    (item: MediaItem) => {
      onChange(item.url);
      setOpen(false);
    },
    [onChange]
  );

  const handlePrompt = useCallback(() => {
    const url = window.prompt('Enter media URL:', value || 'https://');
    if (url) onChange(url);
  }, [value, onChange]);

  const sizeLabel = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const typeIcon = (mime: string) => {
    if (mime.startsWith('image/')) return Image;
    if (mime.startsWith('video/')) return Video;
    return FileText;
  };

  return (
    <div className="flex gap-1">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full text-xs font-mono"
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
          >
            {value ? (
              <Image className="size-3.5" />
            ) : (
              <FolderUp className="size-3.5" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">
              Media Library
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex gap-1 rounded-md border border-input p-1">
                {[
                  { label: 'All', value: null },
                  { label: 'Images', value: 'image' },
                  { label: 'Videos', value: 'video' },
                ].map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setFilterType(f.value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      filterType === f.value
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handlePrompt}
              >
                URL
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => {
                const Icon = typeIcon(item.mimeType);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      handleSelect(item);
                    }}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50',
                      selectedId === item.id &&
                        'border-primary ring-1 ring-primary'
                    )}
                  >
                    {item.mimeType.startsWith('image/') ? (
                      <div className="aspect-[4/3] bg-muted">
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                        <Icon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-xs font-medium">
                        {item.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sizeLabel(item.size)} &middot; {item.width}x
                        {item.height}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground">
                <Image className="mb-2 size-8" />
                <p className="text-sm">No media files found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
