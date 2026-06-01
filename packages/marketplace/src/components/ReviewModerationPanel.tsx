'use client';

import { useState } from 'react';
import type {
  ModuleReviewData,
  ReviewModerationQueue,
  ReviewSortMode,
} from '../types';
import { RatingStars } from './RatingStars';

interface ReviewModerationPanelProps {
  reviews: ModuleReviewData[];
  queue: ReviewModerationQueue | null;
  onApprove: (reviewId: string) => Promise<void>;
  onReject: (reviewId: string, reason: string) => Promise<void>;
  onFlag: (reviewId: string) => Promise<void>;
  onSpamCheck: (
    reviewId: string
  ) => Promise<{
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  } | null>;
  loading?: boolean;
}

export function ReviewModerationPanel({
  reviews,
  queue,
  onApprove,
  onReject,
  onFlag,
  onSpamCheck,
  loading,
}: ReviewModerationPanelProps) {
  const [sortBy, setSortBy] = useState<ReviewSortMode>('recent');
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {}
  );
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [spamResults, setSpamResults] = useState<
    Record<string, { isSpam: boolean; confidence: number; reasons: string[] }>
  >({});

  const pendingCount = queue?.pending ?? 0;
  const flaggedCount = queue?.flagged ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700 font-medium">Pending</p>
            <p className="text-lg font-bold text-amber-800">{pendingCount}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-700 font-medium">Flagged</p>
            <p className="text-lg font-bold text-red-800">{flaggedCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <p className="text-xs text-blue-700 font-medium">Total</p>
            <p className="text-lg font-bold text-blue-800">
              {queue?.total ?? 0}
            </p>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ReviewSortMode)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="recent">Most Recent</option>
          <option value="flag">Flagged First</option>
        </select>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-lg border p-4 ${review.status === 'pending' ? 'border-amber-200' : review.status === 'flagged' ? 'border-red-200' : 'border-gray-200'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {review.userName}
                  </span>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${review.status === 'pending' ? 'bg-amber-100 text-amber-700' : review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {review.status}
                  </span>
                </div>
                <RatingStars rating={review.rating} size="sm" />
                {review.title && (
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {review.title}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">{review.review}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const result = await onSpamCheck(review.id);
                    if (result)
                      setSpamResults((prev) => ({
                        ...prev,
                        [review.id]: result,
                      }));
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 border px-2 py-1 rounded"
                >
                  Spam Check
                </button>
                <button
                  onClick={() => onFlag(review.id)}
                  className="text-xs text-orange-600 hover:text-orange-800"
                >
                  Flag
                </button>
                <button
                  onClick={() => onApprove(review.id)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                {rejecting === review.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={rejectReasons[review.id] || ''}
                      onChange={(e) =>
                        setRejectReasons((prev) => ({
                          ...prev,
                          [review.id]: e.target.value,
                        }))
                      }
                      placeholder="Reason..."
                      className="w-32 text-xs border rounded px-1.5 py-1"
                    />
                    <button
                      onClick={() => {
                        onReject(
                          review.id,
                          rejectReasons[review.id] || 'No reason'
                        );
                        setRejecting(null);
                      }}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setRejecting(null)}
                      className="text-xs border px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRejecting(review.id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>

            {spamResults[review.id] && (
              <div
                className={`mt-2 p-2 rounded text-xs ${spamResults[review.id].isSpam ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
              >
                {spamResults[review.id].isSpam
                  ? `⚠️ Spam detected (${(spamResults[review.id].confidence * 100).toFixed(0)}% confidence): ${spamResults[review.id].reasons.join(', ')}`
                  : `✅ Not spam (${((1 - spamResults[review.id].confidence) * 100).toFixed(0)}% confidence)`}
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No reviews in moderation queue.
          </p>
        )}
      </div>
    </div>
  );
}
