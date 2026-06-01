import { Router } from 'express';
import { CustomCodeController } from '../controllers/CustomCodeController';
const r = Router();
const c = new CustomCodeController();
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
r.post('/:id/toggle', async (req, res) => {
  try {
    res.json(await c.toggle(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/active', async (req, res) => {
  try {
    res.json(await c.getActiveCode());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
