'use client';

import { useState, useEffect } from 'react';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [selectedTaxonomyIds, setSelectedTaxonomyIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
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
    fetch(`/api/taxonomies?siteId=${selectedSiteId}`)
      .then((r) => r.json())
      .then((data) =>
        setTaxonomies(Array.isArray(data) ? data : data?.taxonomies || [])
      )
      .catch(() => setTaxonomies([]));
  }, [selectedSiteId]);

  function autoSlug(val: string) {
    if (
      !slug ||
      slug ===
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
    ) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  }

  function toggleTaxonomy(id: string) {
    setSelectedTaxonomyIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function save(publish: boolean) {
    if (!title || !selectedSiteId) {
      setError('Title and site are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          content,
          excerpt,
          status: publish ? 'PUBLISHED' : 'DRAFT',
          siteId: selectedSiteId,
          taxonomyIds:
            selectedTaxonomyIds.length > 0 ? selectedTaxonomyIds : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      const { post } = await res.json();
      window.location.href = `/posts/${post.id}`;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const groups = taxonomies.reduce((acc: any, t: any) => {
    const type = t.type || 'category';
    if (!acc[type]) acc[type] = [];
    acc[type].push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Post</h1>
        <p className="text-sm text-muted-foreground">Create a new blog post</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              autoSlug(e.target.value);
            }}
            placeholder="Post title"
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Brief summary..."
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder="Write your post content... (Markdown supported)"
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
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
