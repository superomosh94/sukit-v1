import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator';

export class SEOGenerator implements ModuleGenerator {
  readonly moduleId = 'seo-module';
  readonly moduleName = 'SEO Module';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const seoRouter = Router();

seoRouter.post('/analyze', async (req, res, next) => {
  try {
    const { url } = req.body;
    res.json({ url, score: 85, suggestions: ['Add meta description', 'Optimize images'] });
  } catch (err) { next(err); }
});

seoRouter.get('/settings/:pageId', async (req, res, next) => {
  try {
    const settings = await prisma.seoSettings.findUnique({ where: { pageId: req.params.pageId } });
    res.json(settings || {});
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return `model SeoSettings {
  id              String   @id @default(cuid())
  pageId          String   @unique
  metaTitle       String?
  metaDescription String?
  ogImage         String?
  ogTitle         String?
  ogDescription   String?
  canonical       String?
  noIndex         Boolean  @default(false)
  schema          Json?
  updatedAt       DateTime @updatedAt
}`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'SeoMeta.tsx',
        content: `import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoMetaProps { title?: string; description?: string; image?: string; canonical?: string; }

export const SeoMeta: React.FC<SeoMetaProps> = ({ title, description, image, canonical }) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    {title && <meta property="og:title" content={title} />}
    {description && <meta property="og:description" content={description} />}
    {image && <meta property="og:image" content={image} />}
    {canonical && <link rel="canonical" href={canonical} />}
  </Helmet>
);`,
      },
    ];
  }
}
