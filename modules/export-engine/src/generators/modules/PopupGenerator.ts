import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator.js';

export class PopupGenerator implements ModuleGenerator {
  readonly moduleId = 'popup-builder';
  readonly moduleName = 'Popup Builder';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const popupRouter = Router();

popupRouter.get('/', async (req, res, next) => {
  try {
    const popups = await prisma.popup.findMany({ where: { published: true } });
    res.json(popups);
  } catch (err) { next(err); }
});

popupRouter.post('/track', async (req, res, next) => {
  try {
    const { popupId, action } = req.body;
    if (action === 'view') await prisma.popup.update({ where: { id: popupId }, data: { views: { increment: 1 } } });
    if (action === 'click') await prisma.popup.update({ where: { id: popupId }, data: { clicks: { increment: 1 } } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return `model Popup {
  id        String   @id @default(cuid())
  name      String
  content   Json
  triggers  Json
  targeting Json?
  views     Int      @default(0)
  clicks    Int      @default(0)
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'PopupManager.tsx',
        content: `import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';

interface Popup { id: string; name: string; content: Record<string, unknown>; triggers: Record<string, unknown>; }

export const PopupManager: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<Popup[]>('/popups').then(setPopups).catch(() => {});
  }, []);

  const track = useCallback((popupId: string, action: string) => {
    api.post('/popups/track', { popupId, action }).catch(() => {});
  }, []);

  useEffect(() => {
    if (popups.length === 0 || activePopup) return;
    const popup = popups.find(p => !dismissed.has(p.id));
    if (popup) {
      const timer = setTimeout(() => {
        setActivePopup(popup.id);
        track(popup.id, 'view');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popups, activePopup, dismissed, track]);

  const dismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    setActivePopup(null);
  };

  if (!activePopup) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => dismiss(activePopup)}>
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">Welcome!</h3>
        <button onClick={() => { dismiss(activePopup); track(activePopup, 'click'); }} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p className="text-gray-600 mb-4">Thanks for visiting! Check out our latest features and updates.</p>
      <button onClick={() => dismiss(activePopup)} className="w-full py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">Get Started</button>
    </div>
  </div>;
};`,
      },
    ];
  }
}
