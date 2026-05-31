'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit3,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  lastModified: string
}

const MOCK_PAGES: Page[] = [
  { id: '1', title: 'Home', slug: '/', status: 'published', lastModified: new Date().toISOString() },
  { id: '2', title: 'About', slug: '/about', status: 'published', lastModified: new Date().toISOString() },
  { id: '3', title: 'Contact', slug: '/contact', status: 'draft', lastModified: new Date().toISOString() },
]

interface PageListProps {
  pages?: Page[]
  onEdit?: (pageId: string) => void
  onDuplicate?: (pageId: string) => void
  onDelete?: (pageId: string) => void
  onToggleStatus?: (pageId: string, status: 'draft' | 'published') => void
  onNewPage?: () => void
}

export default function PageList({
  pages: initialPages,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  onNewPage,
}: PageListProps) {
  const [pages, setPages] = useState<Page[]>(initialPages || MOCK_PAGES)
  const [search, setSearch] = useState('')

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()),
  )

  const handleToggle = useCallback(
    (pageId: string, current: 'draft' | 'published') => {
      const next = current === 'published' ? 'draft' : 'published'
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, status: next } : p)),
      )
      onToggleStatus?.(pageId, next)
    },
    [onToggleStatus],
  )

  const handleDuplicate = useCallback(
    (page: Page) => {
      const clone: Page = {
        ...page,
        id: crypto.randomUUID(),
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        status: 'draft',
        lastModified: new Date().toISOString(),
      }
      setPages((prev) => [...prev, clone])
      onDuplicate?.(page.id)
    },
    [onDuplicate],
  )

  const handleDelete = useCallback(
    (pageId: string) => {
      if (confirm('Delete this page? This cannot be undone.')) {
        setPages((prev) => prev.filter((p) => p.id !== pageId))
        onDelete?.(pageId)
      }
    },
    [onDelete],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={onNewPage}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New Page
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Modified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{page.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {page.slug}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      page.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    )}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(page.lastModified).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(page.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title="Edit"
                    >
                      <Edit3 className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(page)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title="Duplicate"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(page.id, page.status)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {page.status === 'published' ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(page.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No pages found
          </div>
        )}
      </div>
    </div>
  )
}
