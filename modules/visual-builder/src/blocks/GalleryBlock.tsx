'use client';

import type { Block } from '../types';
import { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt?: string;
}

export default function GalleryBlock({ block }: { block: Block }) {
  const { props } = block;
  const images = (props.images as GalleryImage[]) || [];
  const columns = (props.columns as number) ?? 3;
  const gap = (props.gap as string) || '8px';
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          border: '2px dashed #d1d5db',
          borderRadius: 8,
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        Add images to gallery
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, images.length)}, 1fr)`,
          gap,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: 4,
              aspectRatio: '1',
            }}
          >
            <img
              src={img.src}
              alt={img.alt || ''}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={28} />
          </button>
          <img
            src={images[lightbox].src}
            alt={images[lightbox].alt || ''}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </>
  );
}
