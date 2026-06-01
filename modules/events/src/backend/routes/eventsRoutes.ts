import { Router } from 'express';
import { EventsController } from '../controllers/EventsController';
const router = Router();
const ctrl = new EventsController();

router.get('/', async (req, res) => {
  try {
    res.json(await ctrl.listEvents(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    res.json(await ctrl.getEvent(req.params.id));
  } catch (e: any) {
    res
      .status(e.message === 'Event not found' ? 404 : 500)
      .json({ error: e.message });
  }
});
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createEvent(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    res.json(await ctrl.updateEvent(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    res.json(await ctrl.deleteEvent(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:eventId/tickets', async (req, res) => {
  try {
    res.json(await ctrl.listTickets(req.params.eventId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/tickets', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createTicket(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    res.status(201).json(await ctrl.registerAttendee(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/checkin', async (req, res) => {
  try {
    res.json(await ctrl.checkIn(req.body.attendeeId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/:eventId/attendees', async (req, res) => {
  try {
    res.json(await ctrl.listAttendees(req.params.eventId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:eventId/sessions', async (req, res) => {
  try {
    res.json(await ctrl.listSessions(req.params.eventId));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/sessions', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createSession(req.body));
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
