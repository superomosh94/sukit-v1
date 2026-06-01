import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
const router = Router();
const ctrl = new BookingController();

router.get('/services', async (req, res) => {
  try {
    res.json(await ctrl.listServices());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/services/:id', async (req, res) => {
  try {
    res.json(await ctrl.getService(req.params.id));
  } catch (e: any) {
    res
      .status(e.message === 'Service not found' ? 404 : 500)
      .json({ error: e.message });
  }
});
router.post('/services', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createService(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.put('/services/:id', async (req, res) => {
  try {
    res.json(await ctrl.updateService(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.delete('/services/:id', async (req, res) => {
  try {
    res.json(await ctrl.deleteService(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    res.json(await ctrl.listBookings(req.query as any));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/bookings/:id', async (req, res) => {
  try {
    res.json(await ctrl.getBooking(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/bookings', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createBooking(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.put('/bookings/:id', async (req, res) => {
  try {
    res.json(await ctrl.updateBooking(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    res.json(await ctrl.cancelBooking(req.params.id));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/staff', async (req, res) => {
  try {
    res.json(await ctrl.listStaff());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/staff', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createStaff(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.put('/staff/:id', async (req, res) => {
  try {
    res.json(await ctrl.updateStaff(req.params.id, req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    res.json(await ctrl.listCustomers());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/customers', async (req, res) => {
  try {
    res.status(201).json(await ctrl.createCustomer(req.body));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/slots', async (req, res) => {
  try {
    res.json(
      await ctrl.getTimeSlots(
        req.query.date as string,
        req.query.serviceId as string
      )
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/availability', async (req, res) => {
  try {
    res.json(
      await ctrl.checkAvailability(
        req.query.serviceId as string,
        req.query.date as string,
        req.query.staffId as string
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
