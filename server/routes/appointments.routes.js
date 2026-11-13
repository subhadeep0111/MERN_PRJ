import express from 'express';
import auth from '../middleware/auth.js';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getSlots
} from '../controllers/appointments.controller.js';

const router = express.Router();

router.use(auth);

// IMPORTANT: /slots must come before /:id routes
router.get('/slots', getSlots);

router.get('/', listAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

export default router;
