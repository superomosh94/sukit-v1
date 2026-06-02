'use client';

import { useState, useEffect } from 'react';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/sites')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.sites || [];
        setSites(list);
        if (list.length > 0) setSelectedSiteId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSiteId) return;
    setLoading(true);
    const params = new URLSearchParams({ siteId: selectedSiteId });
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/comments?${params}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [selectedSiteId, statusFilter]);

  async function updateStatus(commentId: string, status: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status } : c))
      );
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) return;
    try {
      await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e: any) {
      setError(e.message);
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      SPAM: 'bg-red-100 text-red-700',
      TRASH: 'bg-gray-100 text-gray-500',
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}
      >
        {status.toLowerCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-sm text-muted-foreground">Moderate site comments</p>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="SPAM">Spam</option>
          <option value="TRASH">Trash</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : comments.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
          No comments yet.
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          {comments.map((comment) => (
            <div key={comment.id} className="px-6 py-4 border-b last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.authorName || comment.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {statusBadge(comment.status)}
                </div>
                <div className="flex items-center gap-2">
                  {comment.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'APPROVED')}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Approve
                    </button>
                  )}
                  {comment.status !== 'SPAM' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'SPAM')}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Spam
                    </button>
                  )}
                  {comment.status !== 'TRASH' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'TRASH')}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Trash
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-xs text-red-700 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground mb-1">{comment.content}</p>
              <p className="text-xs text-muted-foreground">
                {comment.post
                  ? `On post: ${comment.post.title}`
                  : comment.page
                    ? `On page: ${comment.page.title}`
                    : ''}
                {comment.authorEmail && ` · ${comment.authorEmail}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
