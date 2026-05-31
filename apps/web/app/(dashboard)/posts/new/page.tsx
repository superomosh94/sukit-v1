"use client";
import { useState } from "react";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Post</h1>
        <p className="text-sm text-muted-foreground">Create a new blog post</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" className="block w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} placeholder="Write your post content..." className="block w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save Draft</button>
          <button className="rounded-lg bg-secondary px-6 py-2 text-sm font-medium hover:opacity-90">Publish</button>
        </div>
      </div>
    </div>
  );
}
