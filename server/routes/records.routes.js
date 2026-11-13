import express from 'express';
import auth from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getByPatient,
  getById,
  createRecord,
  updateRecord,
  addAttachment,
  listRecords
} from '../controllers/records.controller.js';

const router = express.Router();

router.use(auth);

router.get('/', listRecords);
router.get('/patient/:patientId', getByPatient);
router.get('/:id', getById);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.post('/:id/attachments', upload, addAttachment);

export default router;
