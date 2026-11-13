import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deactivateUser
} from '../controllers/users.controller.js';

const router = express.Router();

// All users routes require auth + admin role
router.use(auth, roleCheck(['admin']));

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deactivateUser);

export default router;
