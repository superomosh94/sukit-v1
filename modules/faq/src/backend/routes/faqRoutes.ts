import { Router } from 'express';
import { FaqController } from '../controllers/FaqController';
const r = Router();
const c = new FaqController();
r.get('/categories', async (req, res) => {
  try {
    res.json(await c.listCategories());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/categories', async (req, res) => {
  try {
    res.status(201).json(await c.createCategory(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/faqs', async (req, res) => {
  try {
    res.json(await c.listFaqs(req.query.categoryId as string));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/faqs', async (req, res) => {
  try {
    res.status(201).json(await c.createFaq(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/faqs/:id/vote', async (req, res) => {
  try {
    res.json(await c.vote(req.params.id, req.body.type));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/search', async (req, res) => {
  try {
    res.json(await c.search(req.query.q as string));
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
