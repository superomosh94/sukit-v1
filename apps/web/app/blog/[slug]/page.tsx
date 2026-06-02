import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { name: true, image: true } },
      taxonomies: { include: { taxonomy: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a
          href="/blog"
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-block"
        >
          &larr; Back to blog
        </a>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
              {post.author?.name && (
                <div className="flex items-center gap-2">
                  {post.author.image && (
                    <img
                      src={post.author.image}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{post.author.name}</span>
                </div>
              )}
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            {post.taxonomies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.taxonomies.map((t) => (
                  <span
                    key={t.taxonomy.id}
                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {t.taxonomy.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt=""
              className="w-full rounded-xl mb-8 object-cover max-h-96"
            />
          )}

          <div className="prose prose-gray max-w-none">
            {post.content.split('\n').map((line, i) => (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
