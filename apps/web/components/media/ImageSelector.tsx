'use client'

import { useState } from 'react'
import { Image, X } from 'lucide-react'
import MediaLibrary from './MediaLibrary'

interface ImageSelectorProps {
  value?: string
  onChange: (url: string | undefined) => void
}

export default function ImageSelector({ value, onChange }: ImageSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      {value ? (
        <div className="group relative inline-block overflow-hidden rounded-lg border">
          <img
            src={value}
            alt="Selected"
            className="h-32 w-48 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 shadow transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-32 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Image className="size-6" />
          <span className="text-xs">Select Image</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-xl border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select Image</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <MediaLibrary
              selectMode
              onSelect={(media) => {
                onChange(media.url)
                setOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
