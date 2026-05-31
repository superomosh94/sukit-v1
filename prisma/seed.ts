import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@sukit.dev' },
    update: {
      hashedPassword: await hashPassword('demo1234'),
    },
    create: {
      name: 'Demo User',
      email: 'demo@sukit.dev',
      hashedPassword: await hashPassword('demo1234'),
      role: 'admin',
    },
  });

  const site = await prisma.site.upsert({
    where: { id: 'demo-site' },
    update: {},
    create: {
      id: 'demo-site',
      name: 'My SUKIT Site',
      domain: 'example.com',
      userId: user.id,
      settings: {
        theme: {
          globalColors: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#F59E0B',
            background: '#FFFFFF',
            text: '#111827',
            heading: '#111827',
            link: '#3B82F6',
            linkHover: '#2563EB',
            muted: '#9CA3AF',
            border: '#E5E7EB',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
          },
          globalTypography: {
            headingFont: 'Inter, sans-serif',
            bodyFont: 'Inter, sans-serif',
            headingWeight: 700,
            bodyWeight: 400,
            baseSize: '16px',
            scaleRatio: 1.25,
            lineHeight: 1.6,
          },
        },
      },
    },
  });

  const homePage = await prisma.page.upsert({
    where: { id: 'demo-home' },
    update: {},
    create: {
      id: 'demo-home',
      siteId: site.id,
      title: 'Home',
      slug: 'home',
      isHome: true,
      pageSettings: {
        seo: {
          title: 'My SUKIT Site - Home',
          description: 'Welcome to my SUKIT site',
        },
      },
    },
  });

  const aboutPage = await prisma.page.upsert({
    where: { id: 'demo-about' },
    update: {},
    create: {
      id: 'demo-about',
      siteId: site.id,
      title: 'About',
      slug: 'about',
      isHome: false,
      pageSettings: {
        seo: {
          title: 'About Us',
          description: 'Learn more about us',
        },
      },
    },
  });

  const heroSection = await prisma.section.upsert({
    where: { id: 'demo-hero-section' },
    update: {},
    create: {
      id: 'demo-hero-section',
      pageId: homePage.id,
      sectionType: 'cover',
      sortOrder: 0,
      settings: {
        fullHeight: true,
        backgroundColor: '#1E3A5F',
        textColor: '#FFFFFF',
        overlay: true,
      },
    },
  });

  const column = await prisma.column.upsert({
    where: { id: 'demo-hero-column' },
    update: {},
    create: {
      id: 'demo-hero-column',
      sectionId: heroSection.id,
      gridRow: 1,
      gridCol: 1,
      span: 12,
      sortOrder: 0,
      settings: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
      },
    },
  });

  await prisma.block.upsert({
    where: { id: 'demo-hero-heading' },
    update: {},
    create: {
      id: 'demo-hero-heading',
      columnId: column.id,
      blockType: 'textBlock',
      sortOrder: 0,
      props: {
        content: '<h1 style="text-align:center;font-size:48px;color:#FFFFFF;">Welcome to SUKIT</h1>',
        tag: 'div',
      },
      styles: {
        marginBottom: '20px',
      },
    },
  });

  await prisma.block.upsert({
    where: { id: 'demo-hero-subtext' },
    update: {},
    create: {
      id: 'demo-hero-subtext',
      columnId: column.id,
      blockType: 'textBlock',
      sortOrder: 1,
      props: {
        content: '<p style="text-align:center;font-size:20px;color:#D1D5DB;">Build beautiful websites visually, then export them as static HTML.</p>',
        tag: 'div',
      },
      styles: {
        marginBottom: '30px',
      },
    },
  });

  await prisma.block.upsert({
    where: { id: 'demo-hero-button' },
    update: {},
    create: {
      id: 'demo-hero-button',
      columnId: column.id,
      blockType: 'buttonBlock',
      sortOrder: 2,
      props: {
        text: 'Get Started',
        url: '#',
        variant: 'primary',
        size: 'lg',
      },
      styles: {
        textAlign: 'center',
      },
    },
  });

  console.log('Seed completed successfully');
  console.log({ userId: user.id, siteId: site.id, pages: [homePage.id, aboutPage.id] });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
