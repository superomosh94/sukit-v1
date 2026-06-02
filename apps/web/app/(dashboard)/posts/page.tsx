'use client';

import { useState, useEffect } from 'react';

interface PostEntry {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string; image?: string } | null;
  taxonomies: { taxonomy: { name: string; type: string } }[];
  _count: { comments: number };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [selectedSiteId, statusFilter]);

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-700',
      DRAFT: 'bg-gray-100 text-gray-600',
      ARCHIVED: 'bg-yellow-100 text-yellow-700',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Blog posts and articles
          </p>
        </div>
        <a
          href="/posts/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Post
        </a>
      </div>

      <div className="flex items-center gap-3">
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
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
          No posts yet. Create your first blog post.
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between px-6 py-4 border-b last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={`/posts/${post.id}`}
                    className="text-sm font-medium hover:text-indigo-600 truncate"
                  >
                    {post.title}
                  </a>
                  {statusBadge(post.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.author?.name || 'Unknown'}</span>
                  <span>
                    {new Date(
                      post.publishedAt || post.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <span>{post._count.comments} comments</span>
                  {post.taxonomies.length > 0 && (
                    <span>
                      {post.taxonomies.map((t) => t.taxonomy.name).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={`/posts/${post.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </a>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
