import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { name: true } },
      taxonomies: { include: { taxonomy: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  const sites = await prisma.site.findMany({
    where: { posts: { some: { status: 'PUBLISHED' } } },
    select: { id: true, name: true },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-2">Latest articles and updates</p>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <a href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                  {post.author?.name && <span>{post.author.name}</span>}
                  {post.publishedAt && (
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  {post.taxonomies.length > 0 && (
                    <span>
                      {post.taxonomies.map((t, i) => (
                        <span key={t.taxonomy.id}>
                          {i > 0 && ', '}
                          {t.taxonomy.name}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </a>
            </article>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No posts yet.</p>
              <p className="text-sm mt-1">Check back soon for new content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
