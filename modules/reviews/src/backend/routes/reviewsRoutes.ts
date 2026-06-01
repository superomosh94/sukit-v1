import { Router } from 'express';
import { ReviewsController } from '../controllers/ReviewsController';
const r = Router();
const c = new ReviewsController();
r.get('/', async (req, res) => {
  try {
    res.json(await c.list(req.query as any));
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
r.post('/:id/approve', async (req, res) => {
  try {
    res.json(await c.approve(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/reject', async (req, res) => {
  try {
    res.json(await c.reject(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/spam', async (req, res) => {
  try {
    res.json(await c.markSpam(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/:id/vote', async (req, res) => {
  try {
    res.json(await c.vote(req.params.id, req.body.type));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/aggregate/:productId', async (req, res) => {
  try {
    res.json(await c.getAggregate(req.params.productId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
