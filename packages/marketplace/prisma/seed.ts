import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleModules = [
  {
    moduleId: '@sukit/visual-builder',
    name: 'Visual Builder',
    description:
      'Drag-and-drop page builder with canvas, blocks, and property panel. Build beautiful pages without code.',
    version: '1.0.0',
    authorName: 'SUKIT Core',
    category: 'tool',
    tags: ['builder', 'drag-drop', 'visual', 'canvas'],
    priceModel: 'free',
    downloads: 5400,
    rating: 4.8,
    ratingCount: 342,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: [
      'sites:read',
      'sites:write',
      'pages:read',
      'pages:write',
      'media:read',
    ],
    status: 'approved',
    featured: true,
    staffPick: true,
  },
  {
    moduleId: '@sukit/site-manager',
    name: 'Site Manager',
    description:
      'Multi-site management, page tree, and team collaboration. Manage unlimited sites from one dashboard.',
    version: '1.0.0',
    authorName: 'SUKIT Core',
    category: 'tool',
    tags: ['sites', 'management', 'multi-site', 'team'],
    priceModel: 'free',
    downloads: 3200,
    rating: 4.6,
    ratingCount: 218,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: ['sites:read', 'sites:write', 'users:read'],
    status: 'approved',
    featured: true,
  },
  {
    moduleId: '@sukit/seo-module',
    name: 'SEO Optimizer',
    description:
      'Advanced SEO tools including meta tags, XML sitemaps, Open Graph, and analytics integration.',
    version: '1.2.0',
    authorName: 'SUKIT',
    category: 'seo',
    tags: ['seo', 'meta', 'sitemap', 'analytics'],
    priceModel: 'free',
    downloads: 1200,
    rating: 4.5,
    ratingCount: 89,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: [
      'pages:read',
      'pages:write',
      'settings:read',
      'settings:write',
    ],
    status: 'approved',
  },
  {
    moduleId: '@sukit/analytics',
    name: 'Analytics Dashboard',
    description:
      'Visitor analytics with real-time charts, heatmaps, session recording, and conversion funnels.',
    version: '1.0.0',
    authorName: 'SUKIT Core',
    category: 'analytics',
    tags: ['analytics', 'charts', 'heatmaps', 'reports'],
    priceModel: 'free',
    downloads: 780,
    rating: 4.8,
    ratingCount: 67,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: ['pages:read', 'settings:read'],
    status: 'approved',
  },
  {
    moduleId: '@sukit/ecommerce',
    name: 'E-Commerce Suite',
    description:
      'Full e-commerce solution with products, cart, checkout, payment gateway integration, and inventory.',
    version: '0.8.0',
    authorName: 'SUKIT',
    category: 'ecommerce',
    tags: ['ecommerce', 'shop', 'products', 'cart', 'payments'],
    priceModel: 'paid',
    price: 29,
    downloads: 650,
    rating: 4.2,
    ratingCount: 54,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: [
      'sites:read',
      'sites:write',
      'pages:read',
      'pages:write',
      'settings:read',
      'settings:write',
    ],
    dependencies: { '@sukit/site-manager': '^1.0.0' },
    status: 'approved',
  },
  {
    moduleId: '@sukit/forms-pro',
    name: 'Forms Pro',
    description:
      'Advanced form builder with conditional logic, file uploads, multi-step forms, and webhook submissions.',
    version: '1.1.0',
    authorName: 'SUKIT',
    category: 'forms',
    tags: ['forms', 'builder', 'conditional', 'uploads'],
    priceModel: 'paid',
    price: 9,
    downloads: 430,
    rating: 4.0,
    ratingCount: 38,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: ['pages:read', 'pages:write'],
    dependencies: { '@sukit/visual-builder': '^1.0.0' },
    status: 'approved',
  },
  {
    moduleId: '@sukit/popup-builder',
    name: 'Popup Builder',
    description:
      'Create popups, slide-ins, notification bars, and fullscreen overlays with A/B testing and analytics.',
    version: '1.0.0',
    authorName: 'SUKIT',
    category: 'marketing',
    tags: ['popups', 'marketing', 'conversion', 'a/b-testing'],
    priceModel: 'free',
    downloads: 890,
    rating: 4.3,
    ratingCount: 72,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: ['pages:read', 'pages:write'],
    dependencies: { '@sukit/visual-builder': '^1.0.0' },
    status: 'approved',
  },
  {
    moduleId: '@sukit/media-library',
    name: 'Media Library',
    description:
      'Upload, optimize with WebP/AVIF, and manage images with folders, tags, and built-in editor.',
    version: '1.0.0',
    authorName: 'SUKIT Core',
    category: 'media',
    tags: ['media', 'images', 'optimization', 'library'],
    priceModel: 'free',
    downloads: 2800,
    rating: 4.7,
    ratingCount: 195,
    screenshots: ['/placeholder.svg'],
    icon: null,
    minSukitVersion: '1.0.0',
    permissions: ['media:read', 'media:write'],
    status: 'approved',
  },
];

async function main() {
  console.log('Seeding marketplace modules...');

  for (const mod of sampleModules) {
    await prisma.marketplaceModule.upsert({
      where: { moduleId: mod.moduleId },
      update: mod,
      create: {
        ...mod,
        publishedAt: new Date(),
      },
    });
    console.log(`  ✓ ${mod.moduleId}`);
  }

  // Create sample versions for each module
  for (const mod of sampleModules) {
    await prisma.moduleVersion.upsert({
      where: { id: `${mod.moduleId}-v${mod.version}` },
      update: { isLatest: true },
      create: {
        id: `${mod.moduleId}-v${mod.version}`,
        moduleId: mod.moduleId,
        version: mod.version,
        downloadUrl: `/api/marketplace/download/${mod.moduleId}/${mod.version}`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        sukVersion: '1.0.0',
        isLatest: true,
        changelog: 'Initial release',
        createdAt: new Date(),
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
