import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const modules = await prisma.marketplaceModule.findMany({
    where: { status: 'published' },
    orderBy: { downloads: 'desc' },
    select: {
      id: true,
      moduleId: true,
      name: true,
      description: true,
      version: true,
      authorName: true,
      category: true,
      tags: true,
      price: true,
      priceModel: true,
      downloads: true,
      rating: true,
      ratingCount: true,
      icon: true,
      featured: true,
      staffPick: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  const mapped = modules.map((m) => ({
    id: m.moduleId,
    name: m.name,
    description: m.description,
    author: m.authorName,
    version: m.version,
    downloads: m.downloads,
    rating: m.rating,
    price: m.price ?? 0,
    icon: m.icon ?? 'package',
    category: m.category,
    tags: m.tags,
    featured: m.featured,
    staffPick: m.staffPick,
    publishedAt: m.publishedAt?.toISOString() ?? null,
  }));

  return NextResponse.json(mapped);
}
