import { Router } from 'express';
import { TestimonialController } from '../controllers/TestimonialController';
const r = Router();
const c = new TestimonialController();
r.get('/', async (req, res) => {
  try {
    res.json(await c.list(req.query.featured === 'true'));
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
r.delete('/:id', async (req, res) => {
  try {
    res.json(await c.delete(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/feature', async (req, res) => {
  try {
    res.json(await c.toggleFeatured(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
