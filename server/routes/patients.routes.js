import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import {
  listPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deactivatePatient
} from '../controllers/patients.controller.js';

const router = express.Router();

// All routes require auth
router.use(auth);

// Read access: admin, doctor, receptionist
router.get('/', roleCheck(['admin', 'doctor', 'receptionist']), listPatients);
router.get('/:id', roleCheck(['admin', 'doctor', 'receptionist']), getPatientById);

// Write access: admin, receptionist
router.post('/', roleCheck(['admin', 'receptionist']), createPatient);
router.put('/:id', roleCheck(['admin', 'receptionist']), updatePatient);
router.delete('/:id', roleCheck(['admin', 'receptionist']), deactivatePatient);

export default router;
