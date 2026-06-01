import { Router } from 'express';
import { TranslationController } from '../controllers/TranslationController';
const r = Router();
const c = new TranslationController();
r.get('/languages', async (req, res) => {
  try {
    res.json(await c.listLanguages());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/languages/:code/toggle', async (req, res) => {
  try {
    res.json(await c.toggleLanguage(req.params.code));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/keys', async (req, res) => {
  try {
    res.json(await c.listKeys(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.post('/keys', async (req, res) => {
  try {
    res.status(201).json(await c.createKey(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.put('/keys/:id', async (req, res) => {
  try {
    res.json(await c.updateKey(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.delete('/keys/:id', async (req, res) => {
  try {
    res.json(await c.deleteKey(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.put('/keys/:keyId/translate/:langCode', async (req, res) => {
  try {
    res.json(
      await c.updateTranslation(
        req.params.keyId,
        req.params.langCode,
        req.body.value
      )
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
r.get('/export', async (req, res) => {
  try {
    res.json(await c.getExport());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
export default r;
