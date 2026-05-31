import { Router } from 'express';
import { PopupController } from '../controllers/PopupController';

const router = Router();
const controller = new PopupController();

router.get('/', async (req, res) => {
  try {
    const result = await controller.list({
      siteId: req.query.siteId as string,
      status: req.query.status as string,
      type: req.query.type as string,
      search: req.query.search as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const result = await controller.getAnalytics(
      req.query.siteId as string,
      (req.query.period as any) || '30d'
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await controller.get(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(err.message === 'Popup not found' ? 404 : 500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await controller.create(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await controller.update(req.params.id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await controller.delete(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/activate', async (req, res) => {
  try {
    const result = await controller.activate(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/pause', async (req, res) => {
  try {
    const result = await controller.pause(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const result = await controller.duplicate(req.params.id);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.message === 'Popup not found' ? 404 : 500).json({ error: err.message });
  }
});

router.post('/track', async (req, res) => {
  try {
    const { popupId, eventType, sessionId } = req.body;
    const result = await controller.trackEvent(popupId, eventType, sessionId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
