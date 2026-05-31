import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator.js';

export class AnalyticsGenerator implements ModuleGenerator {
  readonly moduleId = 'analytics';
  readonly moduleName = 'Analytics';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const analyticsRouter = Router();

analyticsRouter.post('/track', async (req, res, next) => {
  try {
    const { event, data, page, session } = req.body;
    await prisma.analyticsEvent.create({ data: { event, data: data || {}, page, session } });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

analyticsRouter.get('/stats', async (req, res, next) => {
  try {
    const [pageViews, events] = await Promise.all([
      prisma.analyticsEvent.groupBy({ by: ['page'], _count: true, orderBy: { _count: { page: 'desc' } }, take: 20 }),
      prisma.analyticsEvent.groupBy({ by: ['event'], _count: true }),
    ]);
    res.json({ pageViews, events });
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return `model AnalyticsEvent {
  id        String   @id @default(cuid())
  siteId    String
  event     String
  data      Json?
  page      String?
  session   String?
  timestamp DateTime @default(now())
}`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'AnalyticsTracker.tsx',
        content: `import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    api.post('/analytics/track', { event: 'pageview', page: location.pathname, session: crypto.randomUUID?.() }).catch(() => {});
  }, [location]);

  return null;
};`,
      },
    ];
  }
}
