'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Image, Video, FileType, X, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

interface MediaItem {
  url: string;
  name: string;
  type: 'image' | 'video' | 'document';
}

const PRESETS: MediaItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    name: 'Mountains',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    name: 'River',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    name: 'Beach',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    name: 'City',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1503785640985-f62e3aeee448?w=800',
    name: 'Nature',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800',
    name: 'Forest',
    type: 'image',
  },
];

export function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');

  const filtered = search
    ? PRESETS.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : PRESETS;

  const handleSelect = useCallback(
    (mediaUrl: string) => {
      onSelect(mediaUrl);
      setUrl('');
      onClose();
    },
    [onSelect, onClose]
  );

  const handleCustomUrl = useCallback(() => {
    if (url.trim()) {
      handleSelect(url.trim());
    }
  }, [url, handleSelect]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-background p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Media Library</h3>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search presets..."
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {filtered.map((item) => (
            <button
              key={item.url}
              onClick={() => handleSelect(item.url)}
              className="group relative aspect-video overflow-hidden rounded-md border bg-muted transition-transform hover:scale-105"
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Video className="size-6 text-muted-foreground" />
                </div>
              )}
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 text-[10px] text-white">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or paste a URL..."
            className="h-8 flex-1 text-xs font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
          />
          <Button size="sm" className="h-8 text-xs" onClick={handleCustomUrl}>
            Use URL
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
