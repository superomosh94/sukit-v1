'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function EditPostPage() {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [postSiteId, setPostSiteId] = useState('');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [selectedTaxonomyIds, setSelectedTaxonomyIds] = useState<string[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        const post = data.post;
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content || '');
        setExcerpt(post.excerpt || '');
        setStatus(post.status);
        setPostSiteId(post.siteId);
        setPublishedAt(post.publishedAt);
        setSelectedTaxonomyIds(post.taxonomies.map((t: any) => t.taxonomyId));
        setRevisions(post.revisions || []);
      })
      .catch(() => {
        window.location.href = '/posts';
      })
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    if (!postSiteId) return;
    fetch(`/api/taxonomies?siteId=${postSiteId}`)
      .then((r) => r.json())
      .then((data) =>
        setTaxonomies(Array.isArray(data) ? data : data?.taxonomies || [])
      )
      .catch(() => {});
  }, [postSiteId]);

  function toggleTaxonomy(id: string) {
    setSelectedTaxonomyIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          taxonomyIds: selectedTaxonomyIds,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(action: 'publish' | 'archive') {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStatus(data.post.status);
      setPublishedAt(data.post.publishedAt);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const groups = taxonomies.reduce((acc: any, t: any) => {
    const type = t.type || 'category';
    if (!acc[type]) acc[type] = [];
    acc[type].push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-sm text-muted-foreground">
            {status === 'PUBLISHED' && publishedAt
              ? `Published ${new Date(publishedAt).toLocaleDateString()}`
              : 'Draft'}
          </p>
        </div>
        <div className="flex gap-2">
          {status === 'DRAFT' && (
            <button
              onClick={() => changeStatus('publish')}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {status === 'PUBLISHED' && (
            <button
              onClick={() => changeStatus('archive')}
              disabled={saving}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${
              status === 'PUBLISHED'
                ? 'bg-green-100 text-green-700'
                : status === 'ARCHIVED'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
            }`}
          >
            {status.toLowerCase()}
          </span>
          <span>/{slug}</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        {taxonomies.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Taxonomies</label>
            <div className="space-y-2">
              {Object.entries(groups).map(([type, items]: [string, any]) => (
                <div key={type}>
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {type}s
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((t: any) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTaxonomy(t.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          selectedTaxonomyIds.includes(t.id)
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                            : 'bg-background border-gray-200 text-muted-foreground hover:border-gray-300'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {revisions.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold mb-3">Revision History</h2>
          <div className="space-y-2">
            {revisions.map((rev: any) => (
              <div
                key={rev.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  v{rev.version} &middot;{' '}
                  {new Date(rev.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-xs">
                  {rev.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
