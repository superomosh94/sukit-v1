import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true, image: true, email: true } },
      taxonomies: { include: { taxonomy: true } },
      revisions: { orderBy: { version: 'desc' }, take: 10 },
    },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const body = await req.json();
  const { title, content, excerpt, status, featuredImage, taxonomyIds } = body;

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const slug = body.slug || existing.slug;

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title && { title }),
      slug,
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(status && {
        status,
        publishedAt:
          status === 'PUBLISHED' && !existing.publishedAt
            ? new Date()
            : undefined,
      }),
      ...(featuredImage !== undefined && { featuredImage }),
    },
    include: { taxonomies: { include: { taxonomy: true } } },
  });

  if (taxonomyIds) {
    await prisma.postTaxonomy.deleteMany({ where: { postId } });
    await prisma.postTaxonomy.createMany({
      data: taxonomyIds.map((tid: string) => ({ postId, taxonomyId: tid })),
    });
  }

  const lastRevision = await prisma.postRevision.findFirst({
    where: { postId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  await prisma.postRevision.create({
    data: {
      postId,
      version: (lastRevision?.version ?? 0) + 1,
      title: existing.title,
      content: existing.content || '',
      excerpt: existing.excerpt || '',
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { postId } = await params;
  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const body = await req.json();

  if (body.action === 'publish') {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    return NextResponse.json({ post });
  }

  if (body.action === 'archive') {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { status: 'ARCHIVED' },
    });
    return NextResponse.json({ post });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
