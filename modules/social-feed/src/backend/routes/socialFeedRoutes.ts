import { Router } from 'express';
import { SocialFeedController } from '../controllers/SocialFeedController';
const r = Router();
const c = new SocialFeedController();
r.get('/', async (req, res) => {
  try {
    res.json(await c.list(req.query.platform as string));
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
r.post('/:id/moderate', async (req, res) => {
  try {
    res.json(await c.toggleModeration(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
