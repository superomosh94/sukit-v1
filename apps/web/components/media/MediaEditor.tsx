'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Crop, RotateCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MediaEditorProps {
  open: boolean
  imageUrl: string
  onClose: () => void
  onSave: (croppedBlob: Blob) => void
}

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
]

export default function MediaEditor({
  open,
  imageUrl,
  onClose,
  onSave,
}: MediaEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 })
  const [resizeW, setResizeW] = useState(0)
  const [resizeH, setResizeH] = useState(0)
  const dragStart = useRef({ x: 0, y: 0 })
  const dragOrigin = useRef({ x: 0, y: 0, w: 0, h: 0 })

  useEffect(() => {
    if (!open) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight })
      setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight })
      setResizeW(img.naturalWidth)
      setResizeH(img.naturalHeight)
      drawImage(img, { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = imageUrl
  }, [open, imageUrl])

  const drawImage = useCallback(
    (img: HTMLImageElement, rect: { x: number; y: number; w: number; h: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = 600
      canvas.height = 400
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const scale = Math.min(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight,
      )
      const dx = (canvas.width - img.naturalWidth * scale) / 2
      const dy = (canvas.height - img.naturalHeight * scale) / 2
      ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale)

      const sx = dx + rect.x * scale
      const sy = dy + rect.y * scale
      const sw = rect.w * scale
      const sh = rect.h * scale
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(sx, sy, sw, sh)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.fillRect(sx, sy, sw, sh)
    },
    [],
  )

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    dragOrigin.current = { ...crop }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageRef.current) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const canvas = canvasRef.current
    if (!canvas) return

    const scale = Math.min(
      canvas.width / imageSize.w,
      canvas.height / imageSize.h,
    )
    const dx = (e.clientX - rect.left - dragStart.current.x) / scale
    const dy = (e.clientY - rect.top - dragStart.current.y) / scale

    let newCrop = {
      x: dragOrigin.current.x + dx,
      y: dragOrigin.current.y + dy,
      w: dragOrigin.current.w,
      h: dragOrigin.current.h,
    }

    newCrop.x = Math.max(0, Math.min(newCrop.x, imageSize.w - newCrop.w))
    newCrop.y = Math.max(0, Math.min(newCrop.y, imageSize.h - newCrop.h))

    setCrop(newCrop)
    drawImage(imageRef.current, newCrop)
  }

  const handleMouseUp = () => setIsDragging(false)

  const applyCrop = () => {
    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    const oc = document.createElement('canvas')
    const octx = oc.getContext('2d')
    if (!octx) return

    const outputW = resizeW || crop.w
    const outputH = resizeH || crop.h
    oc.width = outputW
    oc.height = outputH
    octx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      outputW,
      outputH,
    )

    oc.toBlob((blob) => {
      if (blob) onSave(blob)
    }, 'image/webp')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Crop className="size-4" />
            <h2 className="text-sm font-medium">Edit Image</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full rounded-lg border bg-muted"
            style={{ aspectRatio: '3/2', cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </div>

        <div className="space-y-4 px-4 pb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Aspect Ratio</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.label}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    aspectRatio === ar.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input text-muted-foreground hover:text-foreground',
                  )}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Width (px)</label>
              <input
                type="number"
                value={resizeW}
                onChange={(e) => {
                  const w = Number(e.target.value)
                  setResizeW(w)
                  if (aspectRatio) setResizeH(Math.round(w / aspectRatio))
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Height (px)</label>
              <input
                type="number"
                value={resizeH}
                onChange={(e) => {
                  const h = Number(e.target.value)
                  setResizeH(h)
                  if (aspectRatio) setResizeW(Math.round(h * aspectRatio))
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" />
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
