import { Router } from 'express';
import { NewsletterController } from '../controllers/NewsletterController';
const r = Router();
const c = new NewsletterController();
r.get('/lists', async (req, res) => {
  try {
    res.json(await c.listLists());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/lists', async (req, res) => {
  try {
    res.status(201).json(await c.createList(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/subscribe', async (req, res) => {
  try {
    res.status(201).json(await c.subscribe(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/subscribers', async (req, res) => {
  try {
    res.json(await c.listSubscribers(req.query.listId as string));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/unsubscribe', async (req, res) => {
  try {
    res.json(await c.unsubscribe(req.body.email));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/campaigns', async (req, res) => {
  try {
    res.json(await c.listCampaigns());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/campaigns', async (req, res) => {
  try {
    res.status(201).json(await c.createCampaign(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/campaigns/:id/send', async (req, res) => {
  try {
    res.json(await c.sendCampaign(req.params.id));
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
