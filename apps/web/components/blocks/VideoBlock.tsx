'use client'

import type { Block } from '@/lib/builder/types'

interface VideoBlockProps {
  block: Block
}

function getYouTubeEmbed(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function getVimeoEmbed(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}` : null
}

export default function VideoBlock({ block }: VideoBlockProps) {
  const { props } = block

  const src = props.src as string | undefined
  const type = (props.type as string) || 'mp4'
  const autoplay = !!props.autoplay
  const loop = !!props.loop
  const controls = props.controls !== false
  const muted = !!props.muted

  if (!src) {
    return (
      <div
        style={{
          aspectRatio: '16 / 9',
          background: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        No video source
      </div>
    )
  }

  const containerStyle: Record<string, string | number> = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
  }

  if (type === 'youtube') {
    const embedUrl = getYouTubeEmbed(src)
    if (!embedUrl) return <div style={containerStyle}>Invalid YouTube URL</div>
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      mute: muted ? '1' : '0',
    })
    return (
      <div style={containerStyle}>
        <iframe
          src={`${embedUrl}?${params}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    )
  }

  if (type === 'vimeo') {
    const embedUrl = getVimeoEmbed(src)
    if (!embedUrl) return <div style={containerStyle}>Invalid Vimeo URL</div>
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      muted: muted ? '1' : '0',
    })
    return (
      <div style={containerStyle}>
        <iframe
          src={`${embedUrl}?${params}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <video
        src={src}
        autoPlay={autoplay}
        loop={loop}
        controls={controls}
        muted={muted}
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}
