import Link from "next/link";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">Blog posts and articles</p>
        </div>
        <Link href="/posts/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">New Post</Link>
      </div>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
        No posts yet. Create your first blog post.
      </div>
    </div>
  );
}
