'use client';

import { useState } from 'react';
import type { ModuleReviewData } from '../types';
import { RatingStars } from './RatingStars';

interface ReviewListProps {
  reviews: ModuleReviewData[];
  averageRating: number;
  totalCount: number;
  loading?: boolean;
  onReport?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onSortChange?: (sort: string) => void;
}

export function ReviewList({
  reviews,
  averageRating,
  totalCount,
  loading,
  onReport,
  onMarkHelpful,
  onSortChange,
}: ReviewListProps) {
  const [sort, setSort] = useState('recent');

  function handleSort(value: string) {
    setSort(value);
    onSortChange?.(value);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Reviews ({totalCount})
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-sm text-gray-500">
              {averageRating.toFixed(1)} average
            </span>
          </div>
        </div>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {review.userName}
                    </span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium text-gray-800 mt-2">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-gray-600 mt-1">{review.review}</p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {review.pros && (
                    <div>
                      <span className="text-xs font-medium text-green-700">
                        Pros
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {review.pros}
                      </p>
                    </div>
                  )}
                  {review.cons && (
                    <div>
                      <span className="text-xs font-medium text-red-700">
                        Cons
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {review.cons}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onMarkHelpful?.(review.id)}
                  className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  Helpful ({review.helpful})
                </button>
                {review.responses && review.responses.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {review.responses.length} response
                    {review.responses.length > 1 ? 's' : ''}
                  </span>
                )}
                {onReport && (
                  <button
                    onClick={() => onReport(review.id)}
                    className="text-xs text-gray-400 hover:text-red-600 ml-auto"
                  >
                    Report
                  </button>
                )}
              </div>

              {review.responses?.map((response) => (
                <div
                  key={response.id}
                  className="mt-3 ml-4 pl-3 border-l-2 border-indigo-200 bg-indigo-50 rounded-r-lg p-3"
                >
                  <p className="text-xs text-indigo-600 font-medium">
                    {response.authorType === 'developer'
                      ? 'Developer Response'
                      : 'Response'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {response.response}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
