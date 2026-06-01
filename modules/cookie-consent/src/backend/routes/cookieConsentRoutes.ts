import { Router } from 'express';
import { CookieConsentController } from '../controllers/CookieConsentController';
const r = Router();
const c = new CookieConsentController();
r.get('/config', async (req, res) => {
  try {
    res.json(await c.getConfig());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.put('/config', async (req, res) => {
  try {
    res.json(await c.updateConfig(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/consent', async (req, res) => {
  try {
    res
      .status(201)
      .json(await c.logConsent(req.body.visitorId, req.body.consent));
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
r.get('/stats', async (req, res) => {
  try {
    res.json(await c.getStats());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
