import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator.js';

export class BlogGenerator implements ModuleGenerator {
  readonly moduleId = 'blog';
  readonly moduleName = 'Blog';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const blogRouter = Router();

blogRouter.get('/posts', async (req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true, image: true } }, category: true },
    });
    res.json(posts);
  } catch (err) { next(err); }
});

blogRouter.get('/posts/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { name: true, image: true } }, category: true },
    });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

blogRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ include: { _count: { select: { posts: true } } } });
    res.json(categories);
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return `model BlogPost {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  image       String?
  published   Boolean   @default(false)
  featured    Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  authorId    String?
  author      User?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}

model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  createdAt DateTime   @default(now())
  posts     BlogPost[]
}`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'BlogList.tsx',
        content: `import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

interface Post { id: string; title: string; slug: string; excerpt?: string; image?: string; publishedAt?: string; author?: { name: string }; }

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get<Post[]>('/blog/posts').then(setPosts).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-32 bg-gray-200 rounded"/>)}</div>;

  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(post => (
    <article key={post.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {post.image && <img src={post.image} alt={post.title} className="w-full h-48 object-cover"/>}
      <div className="p-4"><h2 className="font-semibold text-lg">{post.title}</h2>
      {post.excerpt && <p className="text-gray-600 text-sm mt-1">{post.excerpt}</p>}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        <span>{post.author?.name}</span>
        {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
      </div></div>
    </article>
  ))}</div>;
};`,
      },
    ];
  }
}
