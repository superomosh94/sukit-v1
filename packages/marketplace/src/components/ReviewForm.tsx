'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';

interface ReviewFormProps {
  moduleName: string;
  onSubmit: (data: {
    rating: number;
    title?: string;
    review: string;
    pros?: string;
    cons?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
}

export function ReviewForm({
  moduleName,
  onSubmit,
  onCancel,
  submitting,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (review.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }
    if (review.length > 5000) {
      setError('Review must be under 5000 characters');
      return;
    }

    try {
      await onSubmit({
        rating,
        title: title || undefined,
        review,
        pros: pros || undefined,
        cons: cons || undefined,
      });
      setRating(0);
      setTitle('');
      setReview('');
      setPros('');
      setCons('');
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-4"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Review &ldquo;{moduleName}&rdquo;
      </h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">Rating *</label>
        <RatingStars
          rating={rating}
          interactive
          onChange={setRating}
          size="lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Summarize your experience"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">Review *</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="What do you think about this module?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">{review.length}/5000</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Pros (optional)
          </label>
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            rows={2}
            placeholder="What did you like?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Cons (optional)
          </label>
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            rows={2}
            placeholder="What could be better?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
