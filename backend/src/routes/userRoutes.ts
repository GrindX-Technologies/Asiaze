import express from 'express';
import { getUsers, updateUserStatus, createUser, updateUser, getUserRewards } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/rewards')
  .get(protect, getUserRewards);

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUser);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

export default router;
