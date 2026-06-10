import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

const themeDefinitions = [
  {
    name: 'SUKIT Default',
    slug: 'sukit-default',
    description:
      'Clean, modern theme with slate tones and blue accents. Perfect for professional sites and dashboards.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#0f172a', name: 'Slate 900', slug: 'slate-900' },
            { color: '#3b82f6', name: 'Blue 500', slug: 'blue-500' },
            { color: '#10b981', name: 'Emerald 500', slug: 'emerald-500' },
            { color: '#f59e0b', name: 'Amber 500', slug: 'amber-500' },
            { color: '#f8fafc', name: 'Slate 50', slug: 'slate-50' },
            { color: '#e2e8f0', name: 'Slate 200', slug: 'slate-200' },
            { color: '#1e293b', name: 'Slate 800', slug: 'slate-800' },
          ],
        },
        typography: {
          fontFamilies: [
            {
              fontFamily:
                '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
              name: 'System UI',
              slug: 'system',
            },
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
          ],
          fontSizes: [
            { size: '0.875rem', slug: 'small' },
            { size: '1rem', slug: 'medium' },
            { size: '1.25rem', slug: 'large' },
            { size: '2rem', slug: '2xl' },
            { size: '2.5rem', slug: '3xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.5rem', slug: '1' },
            { size: '1rem', slug: '2' },
            { size: '2rem', slug: '4' },
            { size: '4rem', slug: '6' },
          ],
        },
        layout: { contentSize: '800px', wideSize: '1200px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--blue-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
  {
    name: 'Midnight Blue',
    slug: 'midnight-blue',
    description:
      'Deep navy theme with warm gold accents. Elegant and sophisticated for premium brands.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#0a0e27', name: 'Navy 900', slug: 'navy-900' },
            { color: '#1a1f4e', name: 'Navy 700', slug: 'navy-700' },
            { color: '#f0c040', name: 'Gold 500', slug: 'gold-500' },
            { color: '#d4a030', name: 'Gold 600', slug: 'gold-600' },
            { color: '#e8e0d0', name: 'Cream', slug: 'cream' },
            { color: '#2a2f5e', name: 'Navy 600', slug: 'navy-600' },
            { color: '#f8f4ec', name: 'Off White', slug: 'off-white' },
          ],
        },
        typography: {
          fontFamilies: [
            {
              fontFamily: "Georgia, 'Times New Roman', serif",
              name: 'Georgia',
              slug: 'georgia',
            },
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
          ],
          fontSizes: [
            { size: '0.875rem', slug: 'small' },
            { size: '1rem', slug: 'medium' },
            { size: '1.25rem', slug: 'large' },
            { size: '1.75rem', slug: 'xl' },
            { size: '2.25rem', slug: '2xl' },
            { size: '3rem', slug: '3xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.5rem', slug: '1' },
            { size: '1rem', slug: '2' },
            { size: '1.5rem', slug: '3' },
            { size: '2rem', slug: '4' },
            { size: '3rem', slug: '5' },
            { size: '4rem', slug: '6' },
          ],
        },
        layout: { contentSize: '840px', wideSize: '1280px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--gold-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
  {
    name: 'Forest',
    slug: 'forest',
    description:
      'Earthy green theme inspired by nature. Great for environmental, wellness, and organic brands.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#0d2818', name: 'Forest 900', slug: 'forest-900' },
            { color: '#1a4a2e', name: 'Forest 700', slug: 'forest-700' },
            { color: '#2d8a57', name: 'Green 500', slug: 'green-500' },
            { color: '#4ade80', name: 'Green 400', slug: 'green-400' },
            { color: '#86efac', name: 'Green 300', slug: 'green-300' },
            { color: '#f0faf0', name: 'Mint', slug: 'mint' },
            { color: '#14532d', name: 'Forest 800', slug: 'forest-800' },
          ],
        },
        typography: {
          fontFamilies: [
            {
              fontFamily: "'Merriweather', Georgia, serif",
              name: 'Merriweather',
              slug: 'merriweather',
            },
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
          ],
          fontSizes: [
            { size: '0.875rem', slug: 'small' },
            { size: '1rem', slug: 'medium' },
            { size: '1.125rem', slug: 'large' },
            { size: '1.5rem', slug: 'xl' },
            { size: '2rem', slug: '2xl' },
            { size: '2.75rem', slug: '3xl' },
            { size: '3.5rem', slug: '4xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.25rem', slug: '0' },
            { size: '0.5rem', slug: '1' },
            { size: '1rem', slug: '2' },
            { size: '1.5rem', slug: '3' },
            { size: '2rem', slug: '4' },
            { size: '3rem', slug: '5' },
            { size: '5rem', slug: '6' },
          ],
        },
        layout: { contentSize: '780px', wideSize: '1180px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--green-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
  {
    name: 'Sunset',
    slug: 'sunset',
    description:
      'Warm and vibrant theme with sunset-inspired gradients. Bold choice for creative agencies.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#1a0a0a', name: 'Dark 900', slug: 'dark-900' },
            { color: '#7c2d12', name: 'Amber 900', slug: 'amber-900' },
            { color: '#f97316', name: 'Orange 500', slug: 'orange-500' },
            { color: '#fb923c', name: 'Orange 400', slug: 'orange-400' },
            { color: '#fbbf24', name: 'Amber 400', slug: 'amber-400' },
            { color: '#fef3c7', name: 'Amber 50', slug: 'amber-50' },
            { color: '#431407', name: 'Dark 800', slug: 'dark-800' },
          ],
        },
        typography: {
          fontFamilies: [
            {
              fontFamily: "'Poppins', sans-serif",
              name: 'Poppins',
              slug: 'poppins',
            },
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
          ],
          fontSizes: [
            { size: '0.75rem', slug: 'small' },
            { size: '0.875rem', slug: 'base' },
            { size: '1rem', slug: 'medium' },
            { size: '1.25rem', slug: 'large' },
            { size: '1.75rem', slug: 'xl' },
            { size: '2.5rem', slug: '2xl' },
            { size: '3.5rem', slug: '3xl' },
            { size: '4.5rem', slug: '4xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.25rem', slug: '0' },
            { size: '0.5rem', slug: '1' },
            { size: '0.75rem', slug: '2' },
            { size: '1.25rem', slug: '3' },
            { size: '2rem', slug: '4' },
            { size: '2.5rem', slug: '5' },
            { size: '4rem', slug: '6' },
          ],
        },
        layout: { contentSize: '800px', wideSize: '1200px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--orange-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
  {
    name: 'Ocean',
    slug: 'ocean',
    description:
      'Light and airy theme with oceanic blue tones. Fresh and approachable for any purpose.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#0c4a6e', name: 'Sky 900', slug: 'sky-900' },
            { color: '#0369a1', name: 'Sky 700', slug: 'sky-700' },
            { color: '#0ea5e9', name: 'Sky 500', slug: 'sky-500' },
            { color: '#38bdf8', name: 'Sky 400', slug: 'sky-400' },
            { color: '#7dd3fc', name: 'Sky 300', slug: 'sky-300' },
            { color: '#e0f2fe', name: 'Sky 50', slug: 'sky-50' },
            { color: '#082f49', name: 'Sky 950', slug: 'sky-950' },
          ],
        },
        typography: {
          fontFamilies: [
            {
              fontFamily: "'Nunito', sans-serif",
              name: 'Nunito',
              slug: 'nunito',
            },
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
          ],
          fontSizes: [
            { size: '0.875rem', slug: 'small' },
            { size: '1rem', slug: 'medium' },
            { size: '1.125rem', slug: 'large' },
            { size: '1.5rem', slug: 'xl' },
            { size: '2rem', slug: '2xl' },
            { size: '2.5rem', slug: '3xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.5rem', slug: '1' },
            { size: '0.75rem', slug: '2' },
            { size: '1.25rem', slug: '3' },
            { size: '1.5rem', slug: '4' },
            { size: '2.5rem', slug: '5' },
            { size: '3.5rem', slug: '6' },
          ],
        },
        layout: { contentSize: '820px', wideSize: '1240px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--sky-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
  {
    name: 'Minimal Light',
    slug: 'minimal-light',
    description:
      'Clean, minimal light theme with subtle gray tones. Perfect for content-focused sites.',
    version: '1.0.0',
    author: 'SUKIT',
    config: {
      version: 2,
      settings: {
        color: {
          palette: [
            { color: '#ffffff', name: 'White', slug: 'white' },
            { color: '#111827', name: 'Gray 900', slug: 'gray-900' },
            { color: '#4b5563', name: 'Gray 600', slug: 'gray-600' },
            { color: '#6b7280', name: 'Gray 500', slug: 'gray-500' },
            { color: '#6366f1', name: 'Indigo 500', slug: 'indigo-500' },
            { color: '#818cf8', name: 'Indigo 400', slug: 'indigo-400' },
            { color: '#f9fafb', name: 'Gray 50', slug: 'gray-50' },
            { color: '#e5e7eb', name: 'Gray 200', slug: 'gray-200' },
          ],
        },
        typography: {
          fontFamilies: [
            { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter' },
            {
              fontFamily: "'DM Serif Display', serif",
              name: 'DM Serif Display',
              slug: 'dm-serif',
            },
          ],
          fontSizes: [
            { size: '0.75rem', slug: 'xs' },
            { size: '0.875rem', slug: 'small' },
            { size: '1rem', slug: 'medium' },
            { size: '1.25rem', slug: 'large' },
            { size: '1.5rem', slug: 'xl' },
            { size: '2rem', slug: '2xl' },
            { size: '3rem', slug: '3xl' },
            { size: '4rem', slug: '4xl' },
          ],
        },
        spacing: {
          spacingSizes: [
            { size: '0.25rem', slug: '0' },
            { size: '0.5rem', slug: '1' },
            { size: '0.75rem', slug: '2' },
            { size: '1rem', slug: '3' },
            { size: '1.5rem', slug: '4' },
            { size: '2rem', slug: '5' },
            { size: '3rem', slug: '6' },
            { size: '4rem', slug: '7' },
          ],
        },
        layout: { contentSize: '720px', wideSize: '1100px' },
      },
      styles: {
        blocks: {},
        elements: {
          link: { color: { text: 'var(--wp--preset--color--indigo-500)' } },
        },
      },
    },
    templates: [],
    styles: {},
  },
];

export const defaultThemeConfig = themeDefinitions[0];

function themeToPalette(theme: (typeof themeDefinitions)[0]) {
  const colors = theme.config.settings.color.palette;
  return {
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    author: theme.author,
    version: theme.version,
    palette: Object.fromEntries(colors.map((c) => [c.slug, c.color])),
    fontFamilies: theme.config.settings.typography.fontFamilies,
    layout: theme.config.settings.layout,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const themes = await prisma.theme.findMany({ orderBy: { name: 'asc' } });
  const active = await prisma.theme.findFirst({ where: { active: true } });

  return NextResponse.json({
    themes,
    active: active || null,
    available: themeDefinitions.map(themeToPalette),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, slug, config } = body;

  if (action === 'activate') {
    if (!slug)
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    await prisma.theme.updateMany({
      where: { active: true },
      data: { active: false },
    });
    const theme = await prisma.theme.update({
      where: { slug },
      data: { active: true },
    });
    return NextResponse.json({ theme });
  }

  if (action === 'install' && config?.slug) {
    const c = config;
    const existing = await prisma.theme.findUnique({ where: { slug: c.slug } });
    if (existing) {
      await prisma.theme.update({
        where: { slug: c.slug },
        data: {
          name: c.name,
          description: c.description || '',
          version: c.version || '1.0.0',
          author: c.author || '',
        },
      });
      return NextResponse.json({
        theme: await prisma.theme.findUnique({ where: { slug: c.slug } }),
      });
    }

    const theme = await prisma.theme.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        version: c.version || '1.0.0',
        author: c.author || '',
        config: JSON.parse(JSON.stringify(c.config || {})),
        templates: JSON.parse(JSON.stringify(c.templates || [])),
        styles: JSON.parse(JSON.stringify(c.styles || {})),
      },
    });
    return NextResponse.json({ theme }, { status: 201 });
  }

  if (action === 'install-all') {
    const existing = await prisma.theme.findMany({ select: { slug: true } });
    const existingSlugs = new Set(existing.map((t) => t.slug));
    const created: string[] = [];
    for (const def of themeDefinitions) {
      if (!existingSlugs.has(def.slug)) {
        await prisma.theme.create({
          data: {
            name: def.name,
            slug: def.slug,
            description: def.description || '',
            version: def.version || '1.0.0',
            author: def.author || '',
            config: JSON.parse(JSON.stringify(def.config)),
            templates: JSON.parse(JSON.stringify(def.templates)),
            styles: JSON.parse(JSON.stringify(def.styles)),
          },
        });
        created.push(def.name);
      }
    }
    const allThemes = await prisma.theme.findMany({ orderBy: { name: 'asc' } });
    const active = await prisma.theme.findFirst({ where: { active: true } });
    return NextResponse.json({ themes: allThemes, active, created });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
