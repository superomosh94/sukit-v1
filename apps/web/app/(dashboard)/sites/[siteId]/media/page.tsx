"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

export default function MediaPage() {
  const params = useParams<{ siteId: string }>();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}/media`)
      .then((r) => r.json())
      .then((data) => setMedia(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.siteId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/sites/${params.siteId}/media`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const item = await res.json();
        setMedia((prev) => [item, ...prev]);
      }
    } catch {
      // handled
    } finally {
      setUploading(false);
    }
  }

  async function deleteMedia(mediaId: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/sites/${params.siteId}/media/${mediaId}`, {
      method: "DELETE",
    });
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage images, videos, and files
          </p>
        </div>
        <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*,.pdf"
            disabled={uploading}
          />
        </label>
      </div>

      {loading && (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      )}

      {!loading && media.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
          <p className="text-sm text-muted-foreground">No media uploaded yet</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg border bg-card"
          >
            {item.mimeType.startsWith("image/") ? (
              <img
                src={item.url}
                alt={item.filename}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted text-sm text-muted-foreground">
                {item.mimeType}
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-center bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => deleteMedia(item.id)}
                className="rounded bg-destructive px-2 py-1 text-xs text-white"
              >
                Delete
              </button>
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium">{item.filename}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
