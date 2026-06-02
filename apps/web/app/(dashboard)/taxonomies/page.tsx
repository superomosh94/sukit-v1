'use client';

import { useState, useEffect } from 'react';

export default function TaxonomiesPage() {
  const [taxonomies, setTaxonomies] = useState<any[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'category' | 'tag'>('category');
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
    const params = new URLSearchParams({ siteId: selectedSiteId });
    if (filterType) params.set('type', filterType);
    fetch(`/api/taxonomies?${params}`)
      .then((r) => r.json())
      .then((data) => setTaxonomies(data.taxonomies || []))
      .catch(() => setTaxonomies([]));
  }, [selectedSiteId, filterType]);

  async function handleCreate() {
    if (!name || !slug || !selectedSiteId) {
      setError('Name, slug, and site are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/taxonomies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          type,
          siteId: selectedSiteId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }
      const { taxonomy } = await res.json();
      setTaxonomies((prev) => [
        ...prev,
        { ...taxonomy, terms: [], _count: { pages: 0, posts: 0 } },
      ]);
      setName('');
      setSlug('');
      setDescription('');
      setShowForm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this taxonomy?')) return;
    await fetch(`/api/taxonomies/${id}`, { method: 'DELETE' });
    setTaxonomies((prev) => prev.filter((t) => t.id !== id));
  }

  function autoSlug(val: string) {
    if (
      !slug ||
      slug ===
        name
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

  const categories = taxonomies.filter(
    (t) => (t.type || 'category') === 'category'
  );
  const tags = taxonomies.filter((t) => (t.type || 'category') === 'tag');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories & Tags</h1>
          <p className="text-sm text-muted-foreground">
            Organize content with taxonomies
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Category'}
        </button>
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          <option value="category">Categories</option>
          <option value="tag">Tags</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">New Taxonomy</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  autoSlug(e.target.value);
                }}
                placeholder="Category name"
                className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="category-slug"
                className="block w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="category">Category</option>
                <option value="tag">Tag</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {taxonomies.length === 0 && !showForm ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
          No taxonomies yet. Create categories and tags to organize content.
        </div>
      ) : (
        <>
          {categories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Categories</h2>
              <div className="rounded-xl border bg-card">
                {categories.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between px-6 py-4 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{tax.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{tax.slug} &middot; {tax._count.posts} posts &middot;{' '}
                        {tax._count.pages} pages
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(tax.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center gap-2 bg-card border rounded-full px-3 py-1.5 text-sm"
                  >
                    <span>{tax.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({tax._count.posts})
                    </span>
                    <button
                      onClick={() => handleDelete(tax.id)}
                      className="text-xs text-red-600 hover:text-red-800 ml-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
