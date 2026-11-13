import express from 'express';
import auth from '../middleware/auth.js';
import { getStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(auth);
router.get('/', getStats);

export default router;
