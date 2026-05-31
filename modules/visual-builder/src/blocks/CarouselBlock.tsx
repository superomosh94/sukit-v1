'use client';

import type { Block } from '../types';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
  src: string;
  alt?: string;
}

interface CarouselBlockProps {
  block: Block;
}

export default function CarouselBlock({ block }: CarouselBlockProps) {
  const { props } = block;

  const images = (props.images as CarouselImage[]) || [];
  const autoPlay = !!props.autoPlay;
  const interval = (props.interval as number) ?? 5000;
  const showDots = props.showDots !== false;
  const showArrows = props.showArrows !== false;

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    setCurrent(index);
    resetTimer();
  };

  const prev = () => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    resetTimer();
  };

  const next = () => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlay && images.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
      }, interval);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, interval, images.length]);

  if (images.length === 0) {
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
          borderRadius: 8,
        }}
      >
        Add images to carousel
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          overflow: 'hidden',
          scrollSnapType: 'x mandatory',
          aspectRatio: '16 / 9',
        }}
      >
        <div
          style={{
            display: 'flex',
            transition: 'transform 0.4s ease',
            transform: `translateX(-${current * 100}%)`,
            width: '100%',
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                minWidth: '100%',
                scrollSnapAlign: 'start',
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
                  display: 'block',
                  aspectRatio: '16 / 9',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 0',
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: 'none',
                background: i === current ? '#3b82f6' : '#d1d5db',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
