import { Router } from 'express';
import { MembershipController } from '../controllers/MembershipController';

const router = Router();
const ctrl = new MembershipController();

router.get('/plans', async (req, res) => {
  try {
    res.json(await ctrl.listPlans(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/plans/:id', async (req, res) => {
  try {
    res.json(await ctrl.getPlan(req.params.id));
  } catch (e: any) {
    res
      .status(e.message === 'Plan not found' ? 404 : 500)
      .json({ error: e.message });
  }
});

router.post('/plans', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createPlan(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    res.json(await ctrl.updatePlan(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    res.json(await ctrl.deletePlan(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/members', async (req, res) => {
  try {
    res.json(await ctrl.listMembers(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/members/:id', async (req, res) => {
  try {
    res.json(await ctrl.getMember(req.params.id));
  } catch (e: any) {
    res
      .status(e.message === 'Member not found' ? 404 : 500)
      .json({ error: e.message });
  }
});

router.post('/members', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createMember(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    res.json(await ctrl.updateMember(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  try {
    res.json(await ctrl.deleteMember(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/subscriptions', async (req, res) => {
  try {
    res.json(await ctrl.listSubscriptions(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createSubscription(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    res.json(await ctrl.cancelSubscription(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/badges', async (req, res) => {
  try {
    res.json(await ctrl.listBadges());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/badges', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createBadge(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/badges/assign', async (req, res) => {
  try {
    res.json(await ctrl.assignBadge(req.body.memberId, req.body.badgeId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    res.json(await ctrl.getLeaderboard(req.query.period as string));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/points/grant', async (req, res) => {
  try {
    res.json(
      await ctrl.grantPoints(
        req.body.memberId,
        req.body.points,
        req.body.reason
      )
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    res.json(await ctrl.getAnalytics());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
