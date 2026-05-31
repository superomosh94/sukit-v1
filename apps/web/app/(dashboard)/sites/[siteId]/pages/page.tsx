"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/format";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export default function SitePagesPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}/pages`)
      .then((r) => r.json())
      .then((data) => setPages(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.siteId]);

  async function createPage() {
    const title = prompt("Page title:");
    if (!title) return;

    const res = await fetch(`/api/sites/${params.siteId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug: title.toLowerCase().replace(/\s+/g, "-") }),
    });

    if (res.ok) {
      const page = await res.json();
      setPages((prev) => [...prev, page]);
    }
  }

  async function deletePage(pageId: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/sites/${params.siteId}/pages/${pageId}`, {
      method: "DELETE",
    });
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage pages for this site
          </p>
        </div>
        <button
          onClick={createPage}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Page
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {!loading && pages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
          <p className="text-sm text-muted-foreground">No pages yet</p>
        </div>
      )}

      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div>
                <Link
                  href={`/builder/${params.siteId}/${page.id}`}
                  className="font-medium hover:underline"
                >
                  {page.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>/{page.slug}</span>
                  {page.isHome && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Home
                    </span>
                  )}
                  <span>{formatRelativeTime(page.updatedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/builder/${params.siteId}/${page.id}`}
                className="rounded px-3 py-1 text-xs font-medium hover:bg-accent"
              >
                Edit
              </Link>
              <button
                onClick={() => deletePage(page.id)}
                className="rounded px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
