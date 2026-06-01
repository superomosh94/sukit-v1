import { Router } from 'express';
import { RedirectController } from '../controllers/RedirectController';
const r = Router();
const c = new RedirectController();
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
r.get('/test', async (req, res) => {
  try {
    res.json(await c.test(req.query.source as string));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/404', async (req, res) => {
  try {
    res.status(201).json(await c.log404(req.body.url, req.body.referer));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/404', async (req, res) => {
  try {
    res.json(await c.get404Logs());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/import', async (req, res) => {
  try {
    res.json(await c.importBulk(req.body.items));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
