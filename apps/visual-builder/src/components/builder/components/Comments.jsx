import React, { useState } from 'react';
import { User, MessageSquare, Send } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Comments = ({ 
    comments = [], 
    postId,
    onAddComment,
    loggedInUser = null,
    className 
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        onAddComment?.({
            postId,
            content: newComment,
            author: loggedInUser || { name: 'Guest' },
            parentId: replyTo
        });
        setNewComment('');
        setReplyTo(null);
    };

    const handleSubmitReply = (parentId) => {
        if (!replyText.trim()) return;
        onAddComment?.({
            postId,
            content: replyText,
            author: loggedInUser || { name: 'Guest' },
            parentId
        });
        setReplyText('');
        setReplyingTo(null);
    };

    const renderComments = (commentsList, parentId = null, depth = 0) => {
        const filtered = commentsList.filter(c => c.parentId === parentId);
        if (filtered.length === 0) return null;

        return filtered.map((comment, idx) => (
            <div key={idx} className={cn('mt-4', depth > 0 && 'ml-8 pl-4 border-l border-border')}>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-500" />
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">{comment.author?.name || 'Anonymous'}</p>
                                <p className="text-xs text-text-secondary">{new Date(comment.date).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-text-secondary mt-2">{comment.content}</p>
                    <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="mt-2 text-sm text-primary-500 hover:underline"
                    >
                        {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                    </button>
                    
                    {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={() => handleSubmitReply(comment.id)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
                            >
                                Reply
                            </button>
                        </div>
                    )}
                </div>
                {renderComments(commentsList, comment.id, depth + 1)}
            </div>
        ));
    };

    return (
        <div className={cn('space-y-6', className)}>
            <h3 className="text-xl font-semibold text-text-primary">
                Comments ({comments.filter(c => !c.parentId).length})
            </h3>

            {/* Add Comment Form */}
            <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={loggedInUser ? 'Write a comment...' : 'Login to leave a comment'}
                            rows={3}
                            disabled={!loggedInUser}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                {loggedInUser && (
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmitComment}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                        >
                            <Send className="w-4 h-4" />
                            Post Comment
                        </button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {renderComments(comments)}
                {comments.filter(c => !c.parentId).length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-text-secondary" />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

Comments.displayName = 'Comments';
export default Comments;