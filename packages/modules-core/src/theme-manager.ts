import { PrismaClient } from '@prisma/client';

export interface ThemeConfig {
  name: string;
  slug: string;
  description?: string;
  version?: string;
  author?: string;
  uri?: string;
  config: ThemeStyleConfig;
  templates: ThemeTemplate[];
  styles: ThemeStyleVariations;
}

export interface ThemeStyleConfig {
  version: number;
  settings: {
    color: { palette: { color: string; name: string; slug: string }[]; gradients?: unknown[] };
    typography: { fontFamilies: { fontFamily: string; name: string; slug: string }[]; fontSizes: { size: string; slug: string }[] };
    spacing: { spacingSizes: { size: string; slug: string }[] };
    layout: { contentSize: string; wideSize: string };
  };
  styles: {
    blocks: Record<string, { color?: Record<string, string>; typography?: Record<string, string>; spacing?: Record<string, string>; border?: Record<string, string> }>;
    elements: Record<string, { color?: Record<string, string>; typography?: Record<string, string> }>;
  };
}

export interface ThemeTemplate {
  name: string;
  slug: string;
  content: string;
  postTypes: string[];
}

export interface ThemeStyleVariations {
  [variation: string]: {
    title: string;
    settings: Partial<ThemeStyleConfig['settings']>;
    styles: Partial<ThemeStyleConfig['styles']>;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  name: 'SUKIT Default',
  slug: 'sukit-default',
  description: 'The default SUKIT theme with clean typography and responsive layout.',
  version: '1.0.0',
  author: 'SUKIT',
  config: {
    version: 2,
    settings: {
      color: {
        palette: [
          { color: '#ffffff', name: 'White', slug: 'white' },
          { color: '#0f172a', name: 'Slate 900', slug: 'slate-900' },
          { color: '#64748b', name: 'Slate 500', slug: 'slate-500' },
          { color: '#3b82f6', name: 'Blue 500', slug: 'blue-500' },
          { color: '#10b981', name: 'Emerald 500', slug: 'emerald-500' },
          { color: '#f59e0b', name: 'Amber 500', slug: 'amber-500' },
          { color: '#ef4444', name: 'Red 500', slug: 'red-500' },
          { color: '#f8fafc', name: 'Slate 50', slug: 'slate-50' },
          { color: '#e2e8f0', name: 'Slate 200', slug: 'slate-200' },
          { color: '#1e293b', name: 'Slate 800', slug: 'slate-800' },
        ],
      },
      typography: {
        fontFamilies: [
          { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', name: 'System UI', slug: 'system' },
          { fontFamily: 'Georgia, "Times New Roman", serif', name: 'Georgia', slug: 'georgia' },
          { fontFamily: '"Inter", sans-serif', name: 'Inter', slug: 'inter' },
        ],
        fontSizes: [
          { size: '0.875rem', slug: 'small' },
          { size: '1rem', slug: 'medium' },
          { size: '1.25rem', slug: 'large' },
          { size: '1.5rem', slug: 'xl' },
          { size: '2rem', slug: '2xl' },
          { size: '2.5rem', slug: '3xl' },
          { size: '3.5rem', slug: '4xl' },
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
          { size: '6rem', slug: '7' },
        ],
      },
      layout: { contentSize: '800px', wideSize: '1200px' },
    },
    styles: {
      blocks: {},
      elements: {
        link: { color: { text: 'var(--wp--preset--color--blue-500)' } },
        heading: { typography: { fontWeight: '700' } },
      },
    },
  },
  templates: [],
  styles: {},
};

export class ThemeManager {
  constructor(private prisma: PrismaClient) {}

  async getAll() {
    return this.prisma.theme.findMany({ orderBy: { name: 'asc' } });
  }

  async getById(id: string) {
    return this.prisma.theme.findUnique({ where: { id } });
  }

  async getBySlug(slug: string) {
    return this.prisma.theme.findUnique({ where: { slug } });
  }

  async getActive() {
    return this.prisma.theme.findFirst({ where: { active: true } });
  }

  async activate(slug: string) {
    await this.prisma.theme.updateMany({ where: { active: true }, data: { active: false } });
    return this.prisma.theme.update({ where: { slug }, data: { active: true } });
  }

  async install(config: ThemeConfig): Promise<string> {
    const existing = await this.prisma.theme.findUnique({ where: { slug: config.slug } });
    if (existing) {
      await this.prisma.theme.update({
        where: { slug: config.slug },
        data: {
          name: config.name,
          description: config.description || '',
          version: config.version || '1.0.0',
          author: config.author || '',
          uri: config.uri || null,
          config: JSON.parse(JSON.stringify(config.config)),
          templates: JSON.parse(JSON.stringify(config.templates)),
          styles: JSON.parse(JSON.stringify(config.styles)),
        },
      });
      return existing.id;
    }
    const theme = await this.prisma.theme.create({
      data: {
        name: config.name,
        slug: config.slug,
        description: config.description || '',
        version: config.version || '1.0.0',
        author: config.author || '',
        uri: config.uri || null,
        config: JSON.parse(JSON.stringify(config.config)),
        templates: JSON.parse(JSON.stringify(config.templates)),
        styles: JSON.parse(JSON.stringify(config.styles)),
      },
    });
    return theme.id;
  }

  async uninstall(slug: string) {
    return this.prisma.theme.delete({ where: { slug } });
  }

  async getTemplate(slug: string, templateSlug: string) {
    const theme = await this.prisma.theme.findUnique({ where: { slug } });
    if (!theme) return null;
    const templates = theme.templates as unknown as ThemeTemplate[];
    return templates.find(t => t.slug === templateSlug) || null;
  }

  generateThemeCSS(config: ThemeConfig['config']): string {
    const { settings } = config;
    const colors = settings.color.palette.map(c => `--wp--preset--color--${c.slug}: ${c.color};`).join('\n  ');
    const fonts = settings.typography.fontFamilies.map(f => `--wp--preset--font-family--${f.slug}: ${f.fontFamily};`).join('\n  ');
    const sizes = settings.typography.fontSizes.map(s => `--wp--preset--font-size--${s.slug}: ${s.size};`).join('\n  ');
    const spaces = settings.spacing.spacingSizes.map(s => `--wp--preset--spacing--${s.slug}: ${s.size};`).join('\n  ');
    return `:root {\n  ${colors}\n  ${fonts}\n  ${sizes}\n  ${spaces}\n  --wp--style--block-gap: 1rem;\n}\n`;
  }

  generateStylesCSS(styles: ThemeStyleConfig['styles']): string {
    let css = '';
    for (const [selector, rules] of Object.entries(styles.blocks)) {
      css += `.wp-block-${selector} { `;
      for (const [prop, vals] of Object.entries(rules)) {
        for (const [key, val] of Object.entries(vals)) {
          css += `${prop === 'color' && key === 'text' ? 'color' : prop === 'color' && key === 'background' ? 'background-color' : key}: ${val}; `;
        }
      }
      css += '}\n';
    }
    for (const [selector, rules] of Object.entries(styles.elements)) {
      css += `a.wp-element-${selector} { `;
      for (const [prop, vals] of Object.entries(rules)) {
        for (const [key, val] of Object.entries(vals)) {
          css += `${key === 'text' ? 'color' : key}: ${val}; `;
        }
      }
      css += '}\n';
    }
    return css;
  }
}

export const defaultTheme: ThemeConfig = DEFAULT_THEME;
