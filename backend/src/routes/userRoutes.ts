import express from 'express';
import { getUsers, updateUserStatus, createUser, updateUser, getUserRewards, bulkUpdateStatus, deleteUsers, addSharePoints } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/share')
  .post(protect, addSharePoints);

router.route('/rewards')
  .get(protect, getUserRewards);

router.route('/bulk-status')
  .put(protect, admin, bulkUpdateStatus);

router.route('/bulk-delete')
  .post(protect, admin, deleteUsers);

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUsers);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

export default router;
