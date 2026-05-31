import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, User } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Reviews = ({ 
    reviews = [], 
    averageRating = 0,
    onAddReview,
    className 
}) => {
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddReview?.({ rating, comment, name });
        setRating(0);
        setComment('');
        setName('');
        setShowForm(false);
    };

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.floor(r.rating) === star).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    return (
        <div className={cn('space-y-6', className)}>
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-surface border border-border rounded-lg">
                <div className="text-center">
                    <div className="text-4xl font-bold text-text-primary">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn(
                                'w-4 h-4',
                                i < Math.floor(averageRating) ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                            )} />
                        ))}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">Based on {reviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                    {ratingDistribution.map(({ star, percentage }) => (
                        <div key={star} className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary w-8">{star} ★</span>
                            <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                                <div className="h-full bg-warning-500 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs text-text-secondary w-10">{Math.round(percentage)}%</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Write a Review
                </button>
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-text-primary">Write a Review</h3>
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => {
                                const starValue = i + 1;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setRating(starValue)}
                                        onMouseEnter={() => setHoverRating(starValue)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={cn(
                                            'w-6 h-6 transition-colors',
                                            (hoverRating || rating) >= starValue ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                                        )} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                            required
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Submit Review</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-text-secondary">Cancel</button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review, idx) => (
                    <div key={idx} className="bg-surface border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-text-primary">{review.name}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn(
                                                'w-3 h-3',
                                                i < review.rating ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                                            )} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary mt-2">{review.comment}</p>
                                <p className="text-xs text-text-secondary mt-2">{review.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-1 rounded hover:bg-surface-light">
                                    <ThumbsUp className="w-4 h-4 text-text-secondary" />
                                </button>
                                <button className="p-1 rounded hover:bg-surface-light">
                                    <Flag className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

Reviews.displayName = 'Reviews';
export default Reviews;