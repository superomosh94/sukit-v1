'use client'

import type { Block } from '@/lib/builder/types'

interface MapBlockProps {
  block: Block
}

export default function MapBlock({ block }: MapBlockProps) {
  const { props } = block

  const address = props.address as string | undefined
  const latLng = props.latLng as string | undefined
  const zoom = (props.zoom as number) ?? 14
  const height = (props.height as string) || '400px'
  const provider = (props.provider as string) || 'osm'

  const containerStyle: Record<string, string | number> = {
    width: '100%',
    height,
    overflow: 'hidden',
    borderRadius: 8,
  }

  if (!address && !latLng) {
    return (
      <div
        style={{
          ...containerStyle,
          background: '#e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 14,
          gap: 4,
        }}
      >
        <span>No location set</span>
        <span style={{ fontSize: 12 }}>Enter an address or coordinates</span>
      </div>
    )
  }

  if (provider === 'google') {
    const query = latLng || address
    return (
      <div style={containerStyle}>
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(query || '')}&z=${zoom}&output=embed`}
        />
      </div>
    )
  }

  const lat = latLng?.split(',')[0]?.trim() || '0'
  const lng = latLng?.split(',')[1]?.trim() || '0'
  const query = latLng ? `${lat},${lng}` : address

  return (
    <div style={containerStyle}>
      <iframe
        title="OpenStreetMap"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng},${lat}&layer=mapnik&marker=${lat},${lng}`}
      />
    </div>
  )
}
