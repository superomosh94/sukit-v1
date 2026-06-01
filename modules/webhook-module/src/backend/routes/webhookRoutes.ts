import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';
const r = Router();
const c = new WebhookController();
r.get('/', async (req, res) => {
  try {
    res.json(await c.list());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/:id', async (req, res) => {
  try {
    res.json(await c.get(req.params.id));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
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
r.get('/:id/logs', async (req, res) => {
  try {
    res.json(await c.getLogs(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/test', async (req, res) => {
  try {
    res.json(await c.test(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/logs', async (req, res) => {
  try {
    res.json(await c.getLogs());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
