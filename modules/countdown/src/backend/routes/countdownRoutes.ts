import { Router } from 'express';
import { CountdownController } from '../controllers/CountdownController';
const r = Router();
const c = new CountdownController();
r.get('/', async (req, res) => {
  try {
    res.json(await c.list());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/', async (req, res) => {
  try {
    res.status(201).json(await c.create(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.put('/:id', async (req, res) => {
  try {
    res.json(await c.update(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.delete('/:id', async (req, res) => {
  try {
    res.json(await c.delete(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/view', async (req, res) => {
  try {
    res.json(await c.trackView(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/convert', async (req, res) => {
  try {
    res.json(await c.trackConversion(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/analytics', async (req, res) => {
  try {
    res.json(await c.getAnalytics());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
