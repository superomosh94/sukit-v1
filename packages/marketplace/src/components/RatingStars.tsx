'use client';

import { useMemo } from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const stars = useMemo(() => {
    return Array.from({ length: maxRating }, (_, i) => {
      const filled = i + 1 <= Math.floor(rating);
      const half = !filled && i < rating;
      return { position: i + 1, filled, half };
    });
  }, [rating, maxRating]);

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating}`}
    >
      {stars.map((star) => (
        <button
          key={star.position}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star.position)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          aria-label={`${star.position} star${star.position > 1 ? 's' : ''}`}
        >
          <svg
            className={`${sizeMap[size]} ${star.filled ? 'text-amber-400' : star.half ? 'text-amber-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <defs>
              {star.half && (
                <clipPath id={`half-${star.position}`}>
                  <rect x="0" y="0" width="10" height="20" />
                </clipPath>
              )}
            </defs>
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              clipPath={star.half ? `url(#half-${star.position})` : undefined}
            />
          </svg>
        </button>
      ))}
      <span className="ml-1.5 text-sm text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}
