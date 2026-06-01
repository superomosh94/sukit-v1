import React, { useState, useCallback } from 'react';

export interface Comment {
  id: string;
  author: { id: string; name: string; avatar?: string };
  content: string;
  mentions: string[];
  createdAt: Date;
  resolved: boolean;
  replies?: Comment[];
}

export interface CommentSystemProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (content: string, mentions: string[]) => void;
  onResolveComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export function CommentSystem({
  comments,
  currentUserId,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNewComment(value);
      const atIndex = value.lastIndexOf('@');
      if (atIndex !== -1) {
        const search = value.slice(atIndex + 1);
        setMentionSearch(search);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    },
    []
  );

  const handleMention = useCallback(
    (username: string) => {
      const atIndex = newComment.lastIndexOf('@');
      setNewComment(newComment.slice(0, atIndex) + `@${username} `);
      setShowMentions(false);
    },
    [newComment]
  );

  const handleSubmit = useCallback(() => {
    if (!newComment.trim()) return;
    const mentions = Array.from(newComment.matchAll(/@(\w+)/g)).map(
      (m) => m[1]
    );
    onAddComment(newComment, mentions);
    setNewComment('');
  }, [newComment, onAddComment]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg border ${comment.resolved ? 'border-green-500/30 bg-green-500/5' : 'border-border'} transition-colors`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {comment.author.name[0]}
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {!comment.resolved && (
                  <button
                    onClick={() => onResolveComment(comment.id)}
                    className="p-1 rounded hover:bg-accent text-xs text-muted-foreground"
                  >
                    Resolve
                  </button>
                )}
                {comment.author.id === currentUserId && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="p-1 rounded hover:bg-accent text-xs text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {comment.content.split(/(@\w+)/g).map((part, i) =>
                part.startsWith('@') ? (
                  <span key={i} className="text-primary font-medium">
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
            </p>
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="text-sm">
                    <span className="font-medium">{reply.author.name}</span>{' '}
                    <span className="text-muted-foreground">
                      {reply.content}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={newComment}
          onChange={handleInput}
          placeholder="Add a comment... Use @ to mention someone"
          rows={3}
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          onKeyDown={(e) => {
            if (e.metaKey && e.key === 'Enter') handleSubmit();
          }}
        />
        {showMentions && (
          <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[120px]">
            {['admin', 'editor', 'viewer']
              .filter((u) => u.includes(mentionSearch))
              .map((u) => (
                <button
                  key={u}
                  onClick={() => handleMention(u)}
                  className="block w-full px-2 py-1 text-sm text-left hover:bg-accent rounded transition-colors"
                >
                  @{u}
                </button>
              ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] text-muted-foreground">
            Cmd+Enter to send
          </span>
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}
